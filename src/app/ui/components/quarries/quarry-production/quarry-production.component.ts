import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { QuarryService } from 'src/app/services/common/models/quarry.service';
import { QuarryProductionService } from 'src/app/services/common/models/quarry-production.service';
import { Quarry } from 'src/app/contracts/quarry/quarry';
import { QuarryProduction } from 'src/app/contracts/quarryProduction/quarry-production';
import { CreateQuarryProduction } from 'src/app/contracts/quarryProduction/create-quarry-production';

@Component({
  selector: 'app-quarry-production',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './quarry-production.component.html',
  styleUrls: ['./quarry-production.component.scss']
})
export class QuarryProductionComponent extends BaseComponent implements OnInit {
  
  quarryId: string = '';
  quarry: Quarry | null = null;
  productions: QuarryProduction[] = [];
  
  // Add Production Form
  showAddForm: boolean = false;
  newProduction: CreateQuarryProduction = new CreateQuarryProduction();
  
  // Statistics
  totalProduction: number = 0;
  totalStock: number = 0;
  totalSales: number = 0;
  averageProduction: number = 0;

  constructor(
    spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private router: Router,
    private quarryService: QuarryService,
    private productionService: QuarryProductionService,
    private toastr: ToastrService
  ) {
    super(spinner);
  }

  async ngOnInit(): Promise<void> {
    this.route.params.subscribe(async params => {
      this.quarryId = params['quarryId'];
      if (this.quarryId) {
        await this.loadQuarryDetails();
        await this.loadProductions();
        this.initializeForm();
      }
    });
  }

  async loadQuarryDetails(): Promise<void> {
    try {
      this.quarry = await this.quarryService.getById(this.quarryId);
    } catch (error) {
      this.toastr.error('Ocak bilgileri yüklenemedi');
    }
  }

  async loadProductions(): Promise<void> {
    this.showSpinner(SpinnerType.BallSpinClockwise);
    try {
      const result = await this.productionService.list(0, 100, this.quarryId);
      this.productions = result.items;
      this.calculateStatistics();
      this.hideSpinner(SpinnerType.BallSpinClockwise);
    } catch (error) {
      this.hideSpinner(SpinnerType.BallSpinClockwise);
      this.toastr.error('Üretim verileri yüklenemedi');
    }
  }

  calculateStatistics(): void {
    this.totalProduction = this.productions.reduce((sum, p) => sum + p.productionAmount, 0);
    this.totalStock = this.productions.reduce((sum, p) => sum + p.stockAmount, 0);
    this.totalSales = this.productions.reduce((sum, p) => sum + p.salesAmount, 0);
    this.averageProduction = this.productions.length > 0 ? this.totalProduction / this.productions.length : 0;
  }

  initializeForm(): void {
    this.newProduction = new CreateQuarryProduction();
    this.newProduction.quarryId = this.quarryId;
    this.newProduction.productionUnit = 'ton';
    this.newProduction.stockUnit = 'ton';
    this.newProduction.salesUnit = 'ton';
    
    // Set current week dates
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    this.newProduction.weekStartDate = monday;
    this.newProduction.weekEndDate = sunday;
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) {
      this.initializeForm();
    }
  }

  async saveProduction(): Promise<void> {
    if (!this.validateForm()) {
      return;
    }

    this.showSpinner(SpinnerType.BallSpinClockwise);
    try {
      await this.productionService.add(this.newProduction);
      this.hideSpinner(SpinnerType.BallSpinClockwise);
      this.toastr.success('Üretim verisi başarıyla eklendi');
      this.showAddForm = false;
      await this.loadProductions();
    } catch (error) {
      this.hideSpinner(SpinnerType.BallSpinClockwise);
      this.toastr.error('Üretim verisi eklenemedi');
    }
  }

  validateForm(): boolean {
    if (!this.newProduction.weekStartDate || !this.newProduction.weekEndDate) {
      this.toastr.error('Hafta başlangıç ve bitiş tarihleri zorunludur');
      return false;
    }

    if (this.newProduction.weekStartDate > this.newProduction.weekEndDate) {
      this.toastr.error('Bitiş tarihi başlangıç tarihinden önce olamaz');
      return false;
    }

    if (this.newProduction.productionAmount < 0 || this.newProduction.stockAmount < 0 || this.newProduction.salesAmount < 0) {
      this.toastr.error('Miktarlar negatif olamaz');
      return false;
    }

    return true;
  }

  getEfficiencyPercentage(production: QuarryProduction): number {
    if (production.productionAmount === 0) return 0;
    return (production.salesAmount / production.productionAmount) * 100;
  }

  getEfficiencyClass(percentage: number): string {
    if (percentage < 50) return 'bg-danger';
    if (percentage < 80) return 'bg-warning';
    return 'bg-success';
  }

  back(): void {
    this.router.navigate(['/ocaklar/ocak', this.quarryId]);
  }
}
