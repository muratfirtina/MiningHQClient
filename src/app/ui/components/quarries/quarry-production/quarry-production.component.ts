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
import { SafePipe } from 'src/app/pipes/safe.pipe';

interface ProductionWithCumulativeStock extends QuarryProduction {
  cumulativeStock: number;
}

interface PeriodStats {
  period: string;
  totalProduction: number;
  totalStock: number;
  totalSales: number;
  averageProduction: number;
  recordCount: number;
}

@Component({
  selector: 'app-quarry-production',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SafePipe],
  templateUrl: './quarry-production.component.html',
  styleUrls: ['./quarry-production.component.scss']
})
export class QuarryProductionComponent extends BaseComponent implements OnInit {
  
  quarryId: string = '';
  quarry: Quarry | null = null;
  productions: ProductionWithCumulativeStock[] = [];
  
  // Add Production Form
  showAddForm: boolean = false;
  newProduction: CreateQuarryProduction = new CreateQuarryProduction();
  
  // Statistics
  totalProduction: number = 0;
  totalStock: number = 0;
  totalSales: number = 0;
  averageProduction: number = 0;
  
  // Period Statistics
  showStatsModal: boolean = false;
  statsType: 'weekly' | 'monthly' | 'yearly' = 'weekly';
  periodStats: PeriodStats[] = [];
  
  // Map Modal
  selectedProduction: QuarryProduction | null = null;

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
      
      // Sort by date (oldest first for cumulative calculation)
      const sortedProductions = result.items.sort((a, b) => 
        new Date(a.weekStartDate).getTime() - new Date(b.weekStartDate).getTime()
      );
      
      // Calculate cumulative stock for each record
      // FIXED: Remove stockAmount from calculation - it's already included in production-sales difference
      let cumulativeStock = 0;
      this.productions = sortedProductions.map(prod => {
        // Her hafta: önceki toplam stok + üretim - satış
        // stockAmount eklenmemeli çünkü o zaten (üretim - satış) sonucudur
        cumulativeStock = cumulativeStock + prod.productionAmount - prod.salesAmount;
        
        return {
          ...prod,
          cumulativeStock: cumulativeStock
        };
      });
      
      // Reverse for display (newest first)
      this.productions.reverse();
      
      this.calculateStatistics();
      this.hideSpinner(SpinnerType.BallSpinClockwise);
    } catch (error) {
      this.hideSpinner(SpinnerType.BallSpinClockwise);
      this.toastr.error('Üretim verileri yüklenemedi');
    }
  }

  calculateStatistics(): void {
    this.totalProduction = this.productions.reduce((sum, p) => sum + p.productionAmount, 0);
    this.totalStock = this.productions.length > 0 ? this.productions[0].cumulativeStock : 0; // En son hafta
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

    // Stok hesaplama uyarısı göster
    if (this.newProduction.salesAmount > this.newProduction.productionAmount) {
      const deficit = this.newProduction.salesAmount - this.newProduction.productionAmount;
      const confirmed = confirm(
        `Satış miktarı (${this.newProduction.salesAmount} ton) üretimden (${this.newProduction.productionAmount} ton) fazla!\n\n` +
        `Fark: ${deficit} ton\n\n` +
        `Bu fark önceki stoktan düşülecektir. Devam etmek istiyor musunuz?`
      );
      
      if (!confirmed) {
        return;
      }
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
    
    // UTM validation
    if (this.newProduction.utmEasting || this.newProduction.utmNorthing) {
      if (!this.newProduction.utmEasting || !this.newProduction.utmNorthing) {
        this.toastr.error('UTM koordinatları eksiksiz girilmelidir (hem X hem Y)');
        return false;
      }
      
      // Basic UTM validation for Zone 35T (Turkey)
      if (this.newProduction.utmEasting < 166000 || this.newProduction.utmEasting > 833000) {
        this.toastr.error('UTM Doğruluk (X) değeri 166,000 ile 833,000 arasında olmalıdır');
        return false;
      }
      
      if (this.newProduction.utmNorthing < 0 || this.newProduction.utmNorthing > 9329000) {
        this.toastr.error('UTM Kuzeyleme (Y) değeri 0 ile 9,329,000 arasında olmalıdır');
        return false;
      }
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
  
  // Period Statistics Methods
  showPeriodStats(type: 'weekly' | 'monthly' | 'yearly'): void {
    this.statsType = type;
    this.calculatePeriodStats();
    this.showStatsModal = true;
  }
  
  closePeriodStats(): void {
    this.showStatsModal = false;
  }
  
  calculatePeriodStats(): void {
    this.periodStats = [];
    
    if (this.productions.length === 0) return;
    
    // Sort chronologically for calculation
    const sortedProds = [...this.productions].sort((a, b) => 
      new Date(a.weekStartDate).getTime() - new Date(b.weekStartDate).getTime()
    );
    
    if (this.statsType === 'weekly') {
      // Weekly stats (already have weekly data)
      this.periodStats = sortedProds.map(prod => ({
        period: `${this.formatDate(prod.weekStartDate)} - ${this.formatDate(prod.weekEndDate)}`,
        totalProduction: prod.productionAmount,
        totalStock: prod.cumulativeStock,
        totalSales: prod.salesAmount,
        averageProduction: prod.productionAmount,
        recordCount: 1
      })).reverse();
    } else if (this.statsType === 'monthly') {
      // Group by month
      const monthlyData = new Map<string, ProductionWithCumulativeStock[]>();
      
      sortedProds.forEach(prod => {
        const date = new Date(prod.weekStartDate);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        
        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, []);
        }
        monthlyData.get(monthKey)!.push(prod);
      });
      
      monthlyData.forEach((prods, monthKey) => {
        const [year, month] = monthKey.split('-');
        const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('tr-TR', { month: 'long', year: 'numeric' });
        
        this.periodStats.push({
          period: monthName.charAt(0).toUpperCase() + monthName.slice(1),
          totalProduction: prods.reduce((sum, p) => sum + p.productionAmount, 0),
          totalStock: prods[prods.length - 1].cumulativeStock, // Son hafta stoku
          totalSales: prods.reduce((sum, p) => sum + p.salesAmount, 0),
          averageProduction: prods.reduce((sum, p) => sum + p.productionAmount, 0) / prods.length,
          recordCount: prods.length
        });
      });
      
      this.periodStats.reverse();
    } else if (this.statsType === 'yearly') {
      // Group by year
      const yearlyData = new Map<number, ProductionWithCumulativeStock[]>();
      
      sortedProds.forEach(prod => {
        const year = new Date(prod.weekStartDate).getFullYear();
        
        if (!yearlyData.has(year)) {
          yearlyData.set(year, []);
        }
        yearlyData.get(year)!.push(prod);
      });
      
      yearlyData.forEach((prods, year) => {
        this.periodStats.push({
          period: `${year}`,
          totalProduction: prods.reduce((sum, p) => sum + p.productionAmount, 0),
          totalStock: prods[prods.length - 1].cumulativeStock, // Son hafta stoku
          totalSales: prods.reduce((sum, p) => sum + p.salesAmount, 0),
          averageProduction: prods.reduce((sum, p) => sum + p.productionAmount, 0) / prods.length,
          recordCount: prods.length
        });
      });
      
      this.periodStats.reverse();
    }
  }
  
  formatDate(date: Date | string): string {
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
  }
  
  getStatsTitle(): string {
    switch (this.statsType) {
      case 'weekly':
        return 'Haftalık İstatistikler';
      case 'monthly':
        return 'Aylık İstatistikler';
      case 'yearly':
        return 'Yıllık İstatistikler';
    }
  }
  
  showProductionMap(production: QuarryProduction): void {
    this.selectedProduction = production;
  }
  
  closeMap(): void {
    this.selectedProduction = null;
  }
  
  getProductionMapUrl(): string {
    if (!this.selectedProduction || !this.selectedProduction.latitude || !this.selectedProduction.longitude) {
      return '';
    }
    
    return `https://www.google.com/maps?q=${this.selectedProduction.latitude},${this.selectedProduction.longitude}&z=18&output=embed`;
  }

  back(): void {
    this.router.navigate(['/ocaklar/ocak', this.quarryId]);
  }
}
