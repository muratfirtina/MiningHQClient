import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { MachineService } from 'src/app/services/common/models/machine.service';
import { Machine } from 'src/app/contracts/machine/machine';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomToastrService, ToastrMessageType, ToastrOptions, ToastrPosition } from 'src/app/services/common/custom-toastr.service';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DialogService } from 'src/app/services/common/dialog.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FileUploadComponent } from 'src/app/services/common/file-upload/file-upload.component';

// Additional services
import { BrandService } from 'src/app/services/common/models/brand.service';
import { ModelService } from 'src/app/services/common/models/model.service';
import { MachineTypeService } from 'src/app/services/common/models/machine-type.service';
import { QuarryService } from 'src/app/services/common/models/quarry.service';
import { EmployeeService } from 'src/app/services/common/models/employee.service';

// Contracts
import { Brand } from 'src/app/contracts/brand/brand';
import { Model } from 'src/app/contracts/model/model';
import { MachineType } from 'src/app/contracts/machine-type/machine-type';
import { Quarry } from 'src/app/contracts/quarry/quarry';
import { MachineStats } from 'src/app/contracts/machine/machine-stats';
import { Employee } from 'src/app/contracts/employee/employee';

declare var $: any;

@Component({
  selector: 'app-machine-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    FileUploadComponent
  ],
  templateUrl: './machine-page.component.html',
  styleUrls: ['./machine-page.component.scss', '../../../../../styles.scss']
})
export class MachinePageComponent extends BaseComponent implements OnInit {

  @ViewChild('machineCard', { static: false }) machineCard: ElementRef;

  machine: Machine;
  machineForm: FormGroup;
  machineStats: MachineStats;
  
  // Dropdown data
  brands: Brand[] = [];
  models: Model[] = [];
  machineTypes: MachineType[] = [];
  quarries: Quarry[] = [];
  employees: Employee[] = [];
  filteredModels: Model[] = [];
  
  // State
  isEditMode: boolean = false;
  isLoading: boolean = false;
  isUpdating: boolean = false;
  machineId: string = '';

  constructor(
    spinner: NgxSpinnerService,
    private machineService: MachineService,
    private brandService: BrandService,
    private modelService: ModelService,
    private machineTypeService: MachineTypeService,
    private quarryService: QuarryService,
    private employeeService: EmployeeService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private toastrService: CustomToastrService,
    private dialogService: DialogService,
    private dialog: MatDialog
  ) {
    super(spinner);
    this.initializeForm();
  }

  async ngOnInit(): Promise<void> {
    this.showSpinner(SpinnerType.BallSpinClockwise);
    
    try {
      // Get machine ID from route
      this.machineId = this.route.snapshot.paramMap.get('machineId') || '';
      
      if (!this.machineId) {
        throw new Error('Machine ID not found');
      }

      await Promise.all([
        this.loadMachine(),
        this.loadDropdownData(),
        this.loadMachineStats()
      ]);

      this.showToastr('Makina bilgileri yüklendi', 'Başarılı', ToastrMessageType.Success);
    } catch (error) {
      console.error('Error loading machine page:', error);
      this.showToastr('Makina bilgileri yüklenirken hata oluştu', 'Hata', ToastrMessageType.Error);
      this.router.navigate(['/makinalar']);
    } finally {
      this.hideSpinner(SpinnerType.BallSpinClockwise);
    }
  }

  /**
   * Initialize reactive form
   */
  private initializeForm(): void {
    this.machineForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      serialNumber: ['', [Validators.required, Validators.minLength(3)]],
      brandId: ['', Validators.required],
      modelId: ['', Validators.required],
      machineTypeId: ['', Validators.required],
      quarryId: ['', Validators.required],
      purchaseDate: [''],
      startWorkDate: [''],
      initialWorkingHoursOrKm: [null],
      description: [''],
      currentOperatorId: ['']
    });

    // Watch brand changes
    this.machineForm.get('brandId')?.valueChanges.subscribe(brandId => {
      this.onBrandChange(brandId);
    });
  }

  /**
   * Load machine data
   */
  async loadMachine(): Promise<void> {
    try {
      this.machine = await this.machineService.getMachineById(this.machineId);
      this.populateForm();
    } catch (error) {
      console.error('Error loading machine:', error);
      throw error;
    }
  }

  /**
   * Load dropdown data
   */
  async loadDropdownData(): Promise<void> {
    try {
      const [brandsResponse, machineTypesResponse, quarriesResponse, employeesResponse] = await Promise.all([
        this.brandService.list(0, 100),
        this.machineTypeService.list(0, 100),
        this.quarryService.list(0, 100),
        this.employeeService.list(0, 1000)
      ]);

      this.brands = brandsResponse.items || [];
      this.machineTypes = machineTypesResponse.items || [];
      this.quarries = quarriesResponse.items || [];
      
      // Filter only operators (employees with operator license)
      const allEmployees = employeesResponse.items || [];
      this.employees = allEmployees.filter(emp => 
        emp.operatorLicense !== null && emp.operatorLicense !== undefined
      );
      
      console.log('All employees:', allEmployees.length);
      console.log('Operators only:', this.employees.length);

      // Load all models
      const modelsResponse = await this.modelService.list(0, 100);
      this.models = modelsResponse.items || [];
      
      // Filter models for current brand if machine is loaded
      if (this.machine?.brandId) {
        const response = await this.modelService.listByBrandId(this.machine.brandId);
        this.filteredModels = response.items || [];
      }
    } catch (error) {
      console.error('Error loading dropdown data:', error);
    }
  }

  /**
   * Populate form with machine data
   */
  private populateForm(): void {
    if (this.machine) {
      this.machineForm.patchValue({
        name: this.machine.name,
        serialNumber: this.machine.serialNumber,
        brandId: this.machine.brandId,
        modelId: this.machine.modelId,
        machineTypeId: this.machine.machineTypeId,
        quarryId: this.machine.quarryId,
        purchaseDate: this.machine.purchaseDate ? this.formatDateForInput(this.machine.purchaseDate) : '',
        startWorkDate: this.machine.startWorkDate ? this.formatDateForInput(this.machine.startWorkDate) : '',
        initialWorkingHoursOrKm: this.machine.initialWorkingHoursOrKm || null,
        description: this.machine.description || '',
        currentOperatorId: this.machine.currentOperatorId || ''
      });
    }
  }

  /**
   * Format date for input[type="date"] (YYYY-MM-DD)
   */
  private formatDateForInput(dateInput: string | Date | undefined): string {
    if (!dateInput) return '';
    
    try {
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  }

  /**
   * Handle brand change to filter models
   */
  async onBrandChange(brandId: string): Promise<void> {
    this.machineForm.get('modelId')?.setValue('');
    
    if (brandId) {
      this.showSpinner(SpinnerType.BallSpinClockwise);
      try {
        // Load models for selected brand using API endpoint
        const response = await this.modelService.listByBrandId(brandId);
        this.filteredModels = response.items || [];
        console.log('Filtered models:', this.filteredModels);
        
        if (this.filteredModels.length === 0) {
          this.showToastr('Seçilen marka için model bulunamadı', 'Bilgi', ToastrMessageType.Info);
        }
      } catch (error) {
        console.error('Error loading models for brand:', error);
        this.filteredModels = [];
        this.showToastr('Modeller yüklenirken hata oluştu', 'Hata', ToastrMessageType.Error);
      } finally {
        this.hideSpinner(SpinnerType.BallSpinClockwise);
      }
    } else {
      this.filteredModels = [];
    }
  }

  /**
   * Toggle edit mode
   */
  toggleEditMode(): void {
    console.log('🔄 Toggle Edit Mode Called');
    console.log('Current isEditMode:', this.isEditMode);
    console.log('Machine Data:', this.machine);
    console.log('Form Value:', this.machineForm.value);
    
    this.isEditMode = !this.isEditMode;
    
    console.log('New isEditMode:', this.isEditMode);
    
    if (!this.isEditMode) {
      // Reset form when canceling edit
      this.populateForm();
      console.log('Form reset to:', this.machineForm.value);
    }
    
    this.showToastr(
      this.isEditMode ? 'Düzenleme modu aktif' : 'Düzenleme modu kapatıldı',
      'Bilgi',
      ToastrMessageType.Info
    );
  }

  /**
   * Update machine
   */
  async updateMachine(): Promise<void> {
    console.log('📥 Update Machine Called');
    console.log('Form Valid:', this.machineForm.valid);
    console.log('Form Value:', this.machineForm.value);
    console.log('Form Errors:', this.machineForm.errors);
    
    if (this.machineForm.invalid) {
      console.log('❌ Form is invalid');
      Object.keys(this.machineForm.controls).forEach(key => {
        const control = this.machineForm.get(key);
        if (control?.invalid) {
          console.log(`Invalid field: ${key}`, control.errors);
        }
      });
      
      this.markFormGroupTouched(this.machineForm);
      this.showToastr('Lütfen gerekli alanları doldurun', 'Uyarı', ToastrMessageType.Warning);
      return;
    }

    this.isUpdating = true;
    
    try {
      const formValue = this.machineForm.value;
      
      const updateData = {
        id: this.machine.id,
        name: formValue.name.trim(),
        serialNumber: formValue.serialNumber.trim(),
        modelId: formValue.modelId,
        machineTypeId: formValue.machineTypeId,
        quarryId: formValue.quarryId,
        purchaseDate: formValue.purchaseDate || null,
        startWorkDate: formValue.startWorkDate || null,
        initialWorkingHoursOrKm: formValue.initialWorkingHoursOrKm || null,
        description: formValue.description || '',
        currentOperatorId: formValue.currentOperatorId || null
      };

      console.log('🚀 Sending update data:', updateData);
      
      const response = await this.machineService.update(updateData);
      console.log('✅ Update response:', response);
      
      // Reload machine data after update
      await this.loadMachine();
      console.log('✅ Machine reloaded:', this.machine);
      
      this.isEditMode = false;
      
      this.showToastr('Makina bilgileri başarıyla güncellendi', 'Başarılı', ToastrMessageType.Success);
    } catch (error) {
      console.error('❌ Error updating machine:', error);
      this.showToastr('Güncelleme sırasında hata oluştu', 'Hata', ToastrMessageType.Error);
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * Navigate to machine files page
   */
  goToMachineFiles(): void {
    this.router.navigate([`/makinalar/makina-dosyalar/${this.machine.id}`]);
  }

  /**
   * Navigate to maintenance page
   */
  goToMaintenancePage(): void {
    this.showToastr('Bakım sayfasına yönlendiriliyor', 'Bilgi', ToastrMessageType.Info);
    // TODO: Implement maintenance page navigation
    // this.router.navigate([`/makinalar/bakim/${this.machine.id}`]);
  }

  /**
   * Generate PDF report
   */
  generatePDF(): void {
    try {
      const doc = new jsPDF();
      
      // Add Turkish font support (if available)
      // doc.addFont(openSansBase64, 'OpenSans', 'normal');
      // doc.setFont('OpenSans');
      
      // Header
      doc.setFontSize(20);
      doc.text('Makina Bilgi Raporu', 20, 30);
      
      // Machine info
      doc.setFontSize(12);
      const machineData = [
        ['Makina Adı', this.machine.name],
        ['Seri Numarası', this.machine.serialNumber],
        ['Marka', this.machine.brandName],
        ['Model', this.machine.modelName],
        ['Makina Tipi', this.machine.machineTypeName],
        ['Çalıştığı Ocak', this.machine.quarryName],
        ['Satın Alma Tarihi', this.machine.purchaseDate || 'Belirtilmemiş'],
        ['Açıklama', this.machine.description || 'Yok']
      ];

      autoTable(doc, {
        startY: 50,
        head: [['Alan', 'Bilgi']],
        body: machineData,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 5
        },
        headStyles: {
          fillColor: [44, 97, 115],
          textColor: 255
        }
      });

      // Save PDF
      doc.save(`makina_raporu_${this.machine.name}_${new Date().toISOString().split('T')[0]}.pdf`);
      
      this.showToastr('PDF raporu oluşturuldu', 'Başarılı', ToastrMessageType.Success);
    } catch (error) {
      console.error('Error generating PDF:', error);
      this.showToastr('PDF oluşturulurken hata oluştu', 'Hata', ToastrMessageType.Error);
    }
  }

  /**
   * Delete machine
   */
  async deleteMachine(): Promise<void> {
    const confirmed = confirm(`${this.machine.name} adlı makinayı silmek istediğinizden emin misiniz?`);
    
    if (confirmed) {
      try {
        // TODO: Implement delete API call
        // await this.machineService.delete(this.machine.id);
        
        this.showToastr('Makina başarıyla silindi', 'Başarılı', ToastrMessageType.Success);
        this.router.navigate(['/makinalar']);
      } catch (error) {
        console.error('Error deleting machine:', error);
        this.showToastr('Silme işlemi sırasında hata oluştu', 'Hata', ToastrMessageType.Error);
      }
    }
  }

  /**
   * Navigate back to machines list
   */
  goBack(): void {
    this.router.navigate(['/makinalar']);
  }

  /**
   * Helper methods
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  hasFieldError(fieldName: string, errorType?: string): boolean {
    const field = this.machineForm.get(fieldName);
    if (errorType) {
      return field ? field.hasError(errorType) && field.touched : false;
    }
    return field ? field.invalid && field.touched : false;
  }

  getFieldErrorMessage(fieldName: string): string {
    const field = this.machineForm.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    if (field.errors['required']) return `${this.getFieldDisplayName(fieldName)} gereklidir`;
    if (field.errors['minlength']) return `${this.getFieldDisplayName(fieldName)} en az ${field.errors['minlength'].requiredLength} karakter olmalıdır`;
    
    return 'Geçersiz değer';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      name: 'Makina adı',
      serialNumber: 'Seri numarası',
      brandId: 'Marka',
      modelId: 'Model',
      machineTypeId: 'Makina tipi',
      quarryId: 'Ocak'
    };
    return displayNames[fieldName] || fieldName;
  }

  getMachineIcon(): string {
    const type = this.machine?.machineTypeName?.toLowerCase();
    
    if (type?.includes('ekskavatör') || type?.includes('excavator')) {
      return 'fas fa-tractor';
    } else if (type?.includes('kamyon') || type?.includes('truck')) {
      return 'fas fa-truck';
    } else if (type?.includes('dozer') || type?.includes('bulldozer')) {
      return 'fas fa-bulldozer';
    } else if (type?.includes('loader')) {
      return 'fas fa-truck-loading';
    }
    
    return 'fas fa-cogs';
  }

  formatDate(dateInput: string | Date | undefined): string {
    if (!dateInput) return 'Belirtilmemiş';
    
    try {
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
      return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Geçersiz tarih';
    }
  }

  private showToastr(message: string, title: string, type: ToastrMessageType): void {
    this.toastrService.message(message, title, new ToastrOptions(type, ToastrPosition.TopRight));
  }

  /**
   * Check if machine is featured (premium brands)
   */
  isFeaturedMachine(machine: Machine): boolean {
    return machine.brandName?.toLowerCase().includes('caterpillar') || 
           machine.brandName?.toLowerCase().includes('cat') ||
           machine.brandName?.toLowerCase().includes('komatsu') ||
           machine.brandName?.toLowerCase().includes('volvo');
  }

  /**
   * Navigation methods for quick actions
   */
  viewMachineFiles(): void {
    this.router.navigate(['/makinalar/makina', this.machineId, 'dosyalar']);
  }

  viewMaintenanceHistory(): void {
    this.router.navigate(['/makinalar/makina', this.machineId, 'bakim']);
  }

  viewWorkData(): void {
    this.router.navigate(['/makinalar/makina', this.machineId, 'is-verileri']);
  }

  viewFuelConsumption(): void {
    this.router.navigate(['/makinalar/makina', this.machineId, 'yakit']);
  }

  /**
   * Load machine statistics from backend
   */
  private async loadMachineStats(): Promise<void> {
    try {
      this.machineStats = await this.machineService.getMachineStats(this.machineId);
    } catch (error) {
      console.error('Error loading machine statistics:', error);
      // Default values in case of error
      this.machineStats = {
        machineId: this.machineId,
        machineName: this.machine?.name || '',
        totalWorkDays: 0,
        totalWorkHours: 0,
        totalFuelUsed: 0,
        averageFuelConsumptionPerHour: 0,
        maintenanceCount: 0,
        totalProductionAmount: 0
      };
    }
  }
}