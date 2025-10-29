import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Quarry, MiningEngineerDto, EmployeeDto, MachineDto, QuarryProductionDto } from 'src/app/contracts/quarry/quarry';
import { UpdateQuarry } from 'src/app/contracts/quarry/update-quarry';
import { QuarryService } from 'src/app/services/common/models/quarry.service';
import { EmployeeService } from 'src/app/services/common/models/employee.service';
import { Employee } from 'src/app/contracts/employee/employee';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { QuarryProductionService } from 'src/app/services/common/models/quarry-production.service';

@Component({
  selector: 'app-quarry-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quarry-detail.component.html',
  styleUrls: ['./quarry-detail.component.scss']
})
export class QuarryDetailComponent extends BaseComponent implements OnInit {
  
  quarry: Quarry | null = null;
  quarryId: string = '';
  isEditMode: boolean = false;
  engineers: Employee[] = [];
  
  // Tab kontrolü
  activeTab: 'info' | 'employees' | 'machines' | 'files' | 'production' = 'info';

  constructor(
    spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private router: Router,
    private quarryService: QuarryService,
    private quarryProductionService: QuarryProductionService,
    private employeeService: EmployeeService,
    private toastr: ToastrService
  ) {
    super(spinner);
  }

  async ngOnInit(): Promise<void> {
    this.route.params.subscribe(async params => {
      this.quarryId = params['id'];
      if (this.quarryId) {
        await this.loadQuarryDetails();
        await this.loadEngineers();
      }
    });
  }

  async loadQuarryDetails(): Promise<void> {
    this.showSpinner(SpinnerType.BallSpinClockwise);
    try {
      this.quarry = await this.quarryService.getById(this.quarryId);
      this.hideSpinner(SpinnerType.BallSpinClockwise);
    } catch (error) {
      this.hideSpinner(SpinnerType.BallSpinClockwise);
      this.toastr.error('Ocak detayları yüklenemedi');
      console.error('Ocak detay yükleme hatası:', error);
    }
  }

  async loadEngineers(): Promise<void> {
    try {
      const response = await this.employeeService.list(0, 100);
      this.engineers = response.items.filter(e => 
        e.jobName && e.jobName.toLowerCase().includes('mühendis')
      );
    } catch (error) {
      console.error('Mühendisler yüklenirken hata:', error);
    }
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
  }

  validateQuarry(): boolean {
    if (!this.quarry) return false;

    if (!this.quarry.name || this.quarry.name.trim() === '') {
      this.toastr.error('Ocak adı zorunludur');
      return false;
    }

    // UTM Validation
    if (this.quarry.utmEasting || this.quarry.utmNorthing) {
      if (!this.quarry.utmEasting || !this.quarry.utmNorthing) {
        this.toastr.error('UTM koordinatları eksiksiz girilmelidir (hem X hem Y)');
        return false;
      }
      
      // Basic UTM validation for Zone 35T (Turkey)
      if (this.quarry.utmEasting < 166000 || this.quarry.utmEasting > 833000) {
        this.toastr.error('UTM Doğruluk (X) değeri 166,000 ile 833,000 arasında olmalıdır');
        return false;
      }
      
      if (this.quarry.utmNorthing < 0 || this.quarry.utmNorthing > 9329000) {
        this.toastr.error('UTM Kuzeyleme (Y) değeri 0 ile 9,329,000 arasında olmalıdır');
        return false;
      }
    }

    return true;
  }

  async saveChanges(): Promise<void> {
    if (!this.quarry) return;

    if (!this.validateQuarry()) {
      return;
    }

    const updateQuarry: UpdateQuarry = {
      id: this.quarry.id,
      name: this.quarry.name,
      description: this.quarry.description,
      location: this.quarry.location,
      utmEasting: this.quarry.utmEasting,
      utmNorthing: this.quarry.utmNorthing,
      altitude: this.quarry.altitude,
      pafta: this.quarry.pafta,
      coordinateDescription: this.quarry.coordinateDescription,
      miningEngineerId: this.quarry.miningEngineerId
    };

    this.showSpinner(SpinnerType.BallSpinClockwise);
    try {
      await this.quarryService.update(updateQuarry);
      this.hideSpinner(SpinnerType.BallSpinClockwise);
      this.toastr.success('Ocak başarıyla güncellendi');
      this.isEditMode = false;
      await this.loadQuarryDetails();
    } catch (error) {
      this.hideSpinner(SpinnerType.BallSpinClockwise);
      this.toastr.error('Ocak güncellenemedi');
      console.error('Ocak güncelleme hatası:', error);
    }
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.loadQuarryDetails();
  }

  async deleteQuarry(): Promise<void> {
    if (!confirm('Bu ocağı silmek istediğinizden emin misiniz?')) {
      return;
    }

    this.showSpinner(SpinnerType.BallSpinClockwise);
    try {
      await this.quarryService.delete(this.quarryId);
      this.hideSpinner(SpinnerType.BallSpinClockwise);
      this.toastr.success('Ocak başarıyla silindi');
      this.router.navigate(['/admin/quarries']);
    } catch (error) {
      this.hideSpinner(SpinnerType.BallSpinClockwise);
      this.toastr.error('Ocak silinemedi');
      console.error('Ocak silme hatası:', error);
    }
  }

  setActiveTab(tab: 'info' | 'employees' | 'machines' | 'files' | 'production'): void {
    this.activeTab = tab;
  }

  back(): void {
    this.router.navigate(['/admin/quarries']);
  }
}
