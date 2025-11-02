import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { DailyEntryService } from 'src/app/services/common/models/daily-entry.service';
import { MachineForDailyEntry } from 'src/app/contracts/daily-entry/machine-for-daily-entry';
import { BulkCreateDailyEntry, MachineEntryItem } from 'src/app/contracts/daily-entry/bulk-create-daily-entry';
import { CustomToastrService, ToastrMessageType, ToastrOptions, ToastrPosition } from 'src/app/services/common/custom-toastr.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-daily-entry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './daily-entry.component.html',
  styleUrls: ['./daily-entry.component.scss']
})
export class DailyEntryComponent extends BaseComponent implements OnInit {

  machines: MachineForDailyEntry[] = [];
  filteredMachines: MachineForDailyEntry[] = [];
  entryDate: string = ''; // Selected entry date
  maxDate: string = ''; // For date input max attribute
  searchTerm: string = '';
  
  isLoading: boolean = false;
  isSaving: boolean = false;
  showConfirmModal: boolean = false;
  pendingEntries: MachineEntryItem[] = [];
  confirmationMessage: string = '';
  
  // Filters
  selectedQuarry: string = '';
  selectedMachineType: string = '';
  quarries: string[] = [];
  machineTypes: string[] = [];

  constructor(
    spinner: NgxSpinnerService,
    private dailyEntryService: DailyEntryService,
    private toastrService: CustomToastrService,
    private router: Router
  ) {
    super(spinner);
  }

  async ngOnInit(): Promise<void> {
    // Set max date for date picker (today)
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];
    
    // Set default entry date to yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    this.entryDate = yesterday.toISOString().split('T')[0];
    
    await this.loadMachines();
  }

  async loadMachines(): Promise<void> {
    this.isLoading = true;
    this.showSpinner(SpinnerType.BallSpinClockwise);
    
    try {
      this.machines = await this.dailyEntryService.getMachinesForDailyEntry();
      
      // Initialize machines for entry
      this.machines.forEach(machine => {
        // Reset input values for fresh entry
        machine.newTotalHours = 0;
        machine.fuelConsumption = 0;
        machine.calculatedWorkHours = 0;
        machine.isEdited = false;
      });
      
      // Extract unique quarries and machine types for filters
      this.quarries = [...new Set(this.machines.map(m => m.quarryName).filter(q => q))];
      this.machineTypes = [...new Set(this.machines.map(m => m.machineTypeName).filter(mt => mt))];
      
      this.applyFilters();
      
      this.showToastr(
        `${this.machines.length} makina yüklendi`, 
        'Başarılı', 
        ToastrMessageType.Success
      );
    } catch (error) {
      console.error('Error loading machines:', error);
      this.showToastr('Makinalar yüklenirken hata oluştu', 'Hata', ToastrMessageType.Error);
    } finally {
      this.isLoading = false;
      this.hideSpinner(SpinnerType.BallSpinClockwise);
    }
  }

  onMachineDataChange(machine: MachineForDailyEntry): void {
    // Calculate work hours
    machine.calculatedWorkHours = machine.newTotalHours - machine.currentTotalHours;
    
    // Mark as edited only if meaningful changes were made
    machine.isEdited = machine.newTotalHours > machine.currentTotalHours || machine.fuelConsumption > 0;
    
    // Validation for new total hours
    if (machine.newTotalHours > 0 && machine.calculatedWorkHours < 0) {
      console.warn(`${machine.machineName}: Yeni saat mevcut saatten küçük`);
    } else if (machine.calculatedWorkHours > 24) {
      this.showToastr(
        `${machine.machineName}: Günlük çalışma 24 saati geçemez`, 
        'Uyarı', 
        ToastrMessageType.Warning
      );
    }
  }

  applyFilters(): void {
    this.filteredMachines = this.machines.filter(machine => {
      const matchesSearch = !this.searchTerm || 
        machine.machineName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        machine.serialNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        machine.brandName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        machine.modelName?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesQuarry = !this.selectedQuarry || machine.quarryName === this.selectedQuarry;
      const matchesMachineType = !this.selectedMachineType || machine.machineTypeName === this.selectedMachineType;
      
      return matchesSearch && matchesQuarry && matchesMachineType;
    });
  }

  async saveDailyEntries(): Promise<void> {
    // Get only edited machines with valid data
    const editedMachines = this.machines.filter(m => 
      m.isEdited && 
      (m.newTotalHours > m.currentTotalHours || m.fuelConsumption > 0)
    );

    if (editedMachines.length === 0) {
      this.showToastr('Hiçbir değişiklik yapılmadı', 'Bilgi', ToastrMessageType.Info);
      return;
    }

    // Validate entry date
    const selectedDate = new Date(this.entryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate > today) {
      this.showToastr('Gelecek tarihli kayıt yapılamaz', 'Hata', ToastrMessageType.Error);
      return;
    }

    // Prepare entries for confirmation
    this.pendingEntries = editedMachines.map(machine => ({
      machineId: machine.machineId,
      currentTotalHours: machine.currentTotalHours,
      newTotalHours: machine.newTotalHours,
      fuelConsumption: machine.fuelConsumption
    }));

    // Prepare confirmation message
    const totalWorkHours = this.getTotalWorkHours();
    const totalFuel = this.getTotalFuel();
    const entryDateFormatted = new Date(this.entryDate).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    this.confirmationMessage = `${entryDateFormatted} tarihi için ${editedMachines.length} makina, ${totalWorkHours} saat çalışma ve ${totalFuel.toFixed(2)} litre yakıt kaydı yapılacak.`;

    // Show confirmation modal
    this.showConfirmModal = true;
  }

  confirmSave(): void {
    this.showConfirmModal = false;
    this.performSave();
  }

  cancelSave(): void {
    this.showConfirmModal = false;
    this.pendingEntries = [];
    this.confirmationMessage = '';
  }

  async performSave(): Promise<void> {
    this.isSaving = true;
    this.showSpinner(SpinnerType.BallSpinClockwise);

    try {
      const bulkData: BulkCreateDailyEntry = {
        entryDate: this.entryDate,
        machineEntries: this.pendingEntries
      };

      const response = await this.dailyEntryService.bulkCreateDailyEntry(bulkData);

      if (response.success) {
        this.showToastr(response.message, 'Başarılı', ToastrMessageType.Success);
        // Reload machines to get updated data
        await this.loadMachines();
      } else {
        this.showToastr(response.message, 'Uyarı', ToastrMessageType.Warning);
        
        // Show error messages
        if (response.errorMessages && response.errorMessages.length > 0) {
          response.errorMessages.forEach(error => {
            this.showToastr(error, 'Hata', ToastrMessageType.Error);
          });
        }
      }
    } catch (error) {
      console.error('Error saving daily entries:', error);
      this.showToastr('Kayıt sırasında hata oluştu', 'Hata', ToastrMessageType.Error);
    } finally {
      this.isSaving = false;
      this.hideSpinner(SpinnerType.BallSpinClockwise);
    }
  }

  getEditedCount(): number {
    return this.machines.filter(m => m.isEdited).length;
  }

  getTotalWorkHours(): number {
    return this.machines
      .filter(m => m.isEdited)
      .reduce((sum, m) => sum + (m.calculatedWorkHours || 0), 0);
  }

  getTotalFuel(): number {
    return this.machines
      .filter(m => m.isEdited)
      .reduce((sum, m) => sum + (m.fuelConsumption || 0), 0);
  }

  setDateToYesterday(): void {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    this.entryDate = yesterday.toISOString().split('T')[0];
  }

  setDateToToday(): void {
    const today = new Date();
    this.entryDate = today.toISOString().split('T')[0];
  }

  resetForm(): void {
    this.loadMachines();
  }

  private showToastr(message: string, title: string, type: ToastrMessageType): void {
    this.toastrService.message(message, title, new ToastrOptions(type, ToastrPosition.TopRight));
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'Hiç girilmemiş';
    return new Date(date).toLocaleDateString('tr-TR');
  }
}
