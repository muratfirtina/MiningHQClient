import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { FuelReportService } from 'src/app/services/common/models/fuel-report.service';
import { MachineFuelReport } from 'src/app/contracts/fuel-report/machine-fuel-report';
import { CustomToastrService, ToastrMessageType, ToastrOptions, ToastrPosition } from 'src/app/services/common/custom-toastr.service';

@Component({
  selector: 'app-fuel-consumption-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fuel-consumption-report.component.html',
  styleUrls: ['./fuel-consumption-report.component.scss']
})
export class FuelConsumptionReportComponent extends BaseComponent implements OnInit {

  machineId: string = '';
  report: MachineFuelReport | null = null;
  
  // Filter options
  filterPeriod: 'custom' | 'week' | 'month' | 'year' | 'all' = 'month';
  startDate: string = '';
  endDate: string = '';
  maxDate: string = '';
  
  // View mode
  viewMode: 'daily' | 'weekly' | 'monthly' = 'daily';
  
  // Detail table filter
  detailStartDate: string = '';
  detailEndDate: string = '';
  filteredReport: MachineFuelReport | null = null;
  
  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  pageList: number[] = [];
  pages: number = 0;
  
  isLoading: boolean = false;

  constructor(
    spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private router: Router,
    private fuelReportService: FuelReportService,
    private toastrService: CustomToastrService
  ) {
    super(spinner);
  }

  async ngOnInit(): Promise<void> {
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];
    
    // Set default dates (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    this.startDate = thirtyDaysAgo.toISOString().split('T')[0];
    this.endDate = today.toISOString().split('T')[0];
    
    this.machineId = this.route.snapshot.paramMap.get('machineId') || '';
    
    if (!this.machineId) {
      this.showToastr('Makina ID bulunamadı', 'Hata', ToastrMessageType.Error);
      this.router.navigate(['/makinalar']);
      return;
    }

    await this.loadReport();
  }

  async loadReport(): Promise<void> {
    this.isLoading = true;
    this.showSpinner(SpinnerType.BallSpinClockwise);

    try {
      this.report = await this.fuelReportService.getMachineFuelReport(
        this.machineId,
        this.startDate,
        this.endDate
      );
      
      // Initialize detail filter dates with report dates
      this.detailStartDate = this.report.startDate.split('T')[0];
      this.detailEndDate = this.report.endDate.split('T')[0];
      
      // Apply initial filter (no filter, show all)
      this.applyDetailFilter();
      
      this.showToastr('Rapor yüklendi', 'Başarılı', ToastrMessageType.Success);
    } catch (error) {
      console.error('Error loading fuel report:', error);
      this.showToastr('Rapor yüklenirken hata oluştu', 'Hata', ToastrMessageType.Error);
    } finally {
      this.isLoading = false;
      this.hideSpinner(SpinnerType.BallSpinClockwise);
    }
  }

  onPeriodChange(): void {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    switch (this.filterPeriod) {
      case 'week':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        this.startDate = weekAgo.toISOString().split('T')[0];
        this.endDate = today;
        break;
      case 'month':
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        this.startDate = monthAgo.toISOString().split('T')[0];
        this.endDate = today;
        break;
      case 'year':
        const yearAgo = new Date();
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        this.startDate = yearAgo.toISOString().split('T')[0];
        this.endDate = today;
        break;
      case 'all':
        this.startDate = '2020-01-01';
        this.endDate = today;
        break;
      case 'custom':
        // Keep current dates
        break;
    }
    
    this.loadReport();
  }

  applyCustomFilter(): void {
    this.filterPeriod = 'custom';
    this.loadReport();
  }

  goBack(): void {
    this.router.navigate(['/makinalar/makina', this.machineId]);
  }

  exportData(): void {
    console.log('Export data functionality');
    this.showToastr('Export özelliği yakında eklenecek', 'Bilgi', ToastrMessageType.Info);
  }

  formatDate(date: string | Date): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('tr-TR');
  }

  getMonthName(month: number): string {
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    return months[month - 1] || '';
  }

  private showToastr(message: string, title: string, type: ToastrMessageType): void {
    this.toastrService.message(message, title, new ToastrOptions(type, ToastrPosition.TopRight));
  }

  // Chart data helpers
  getChartData(): { labels: string[], data: number[] } {
    if (!this.filteredReport) return { labels: [], data: [] };

    switch (this.viewMode) {
      case 'daily':
        return {
          labels: this.filteredReport.dailyBreakdown.map(d => this.formatDate(d.date)),
          data: this.filteredReport.dailyBreakdown.map(d => d.fuelConsumption)
        };
      case 'weekly':
        return {
          labels: this.filteredReport.weeklySummary.map(w => `${w.year} - Hafta ${w.weekNumber}`),
          data: this.filteredReport.weeklySummary.map(w => w.totalFuel)
        };
      case 'monthly':
        return {
          labels: this.filteredReport.monthlySummary.map(m => `${this.getMonthName(m.month)} ${m.year}`),
          data: this.filteredReport.monthlySummary.map(m => m.totalFuel)
        };
      default:
        return { labels: [], data: [] };
    }
  }

  getMaxValue(): number {
    const chartData = this.getChartData();
    return Math.max(...chartData.data, 1); // Minimum 1 to avoid division by zero
  }

  // Pagination helpers
  getPaginatedData(): any[] {
    if (!this.filteredReport) return [];

    let data: any[] = [];
    switch (this.viewMode) {
      case 'daily':
        data = this.filteredReport.dailyBreakdown;
        break;
      case 'weekly':
        data = this.filteredReport.weeklySummary;
        break;
      case 'monthly':
        data = this.filteredReport.monthlySummary;
        break;
    }

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return data.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    if (!this.filteredReport) return 0;

    let dataLength = 0;
    switch (this.viewMode) {
      case 'daily':
        dataLength = this.filteredReport.dailyBreakdown.length;
        break;
      case 'weekly':
        dataLength = this.filteredReport.weeklySummary.length;
        break;
      case 'monthly':
        dataLength = this.filteredReport.monthlySummary.length;
        break;
    }

    this.pages = Math.ceil(dataLength / this.pageSize);
    return this.pages;
  }

  initializePagination() {
    this.pageList = [];
    const totalPages = this.totalPages;
    
    if (totalPages >= 7) {
      if (this.currentPage - 3 <= 0) {
        for (let i = 1; i <= 7; i++) {
          this.pageList.push(i);
        }
      } else if (this.currentPage + 3 > totalPages) {
        for (let i = totalPages - 6; i <= totalPages; i++) {
          this.pageList.push(i);
        }
      } else {
        for (let i = this.currentPage - 3; i <= this.currentPage + 3; i++) {
          this.pageList.push(i);
        }
      }
    } else {
      for (let i = 1; i <= totalPages; i++) {
        this.pageList.push(i);
      }
    }
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.initializePagination();
    }
  }

  onViewModeChange(): void {
    this.currentPage = 1; // Reset to first page when view mode changes
    this.initializePagination();
  }

  onPageSizeChange(): void {
    this.currentPage = 1; // Reset to first page when page size changes
    this.initializePagination();
  }

  getTotalRecords(): number {
    if (!this.filteredReport) return 0;

    switch (this.viewMode) {
      case 'daily':
        return this.filteredReport.dailyBreakdown.length;
      case 'weekly':
        return this.filteredReport.weeklySummary.length;
      case 'monthly':
        return this.filteredReport.monthlySummary.length;
      default:
        return 0;
    }
  }

  // Detail filter methods
  applyDetailFilter(): void {
    if (!this.report) return;

    const startDate = new Date(this.detailStartDate);
    const endDate = new Date(this.detailEndDate);
    endDate.setHours(23, 59, 59, 999); // Include entire end date

    // Clone the report and filter data
    this.filteredReport = {
      ...this.report,
      dailyBreakdown: this.report.dailyBreakdown.filter(d => {
        const date = new Date(d.date);
        return date >= startDate && date <= endDate;
      }),
      weeklySummary: this.report.weeklySummary.filter(w => {
        // Find any daily data in this week that falls within range
        return this.report.dailyBreakdown.some(d => {
          const date = new Date(d.date);
          const weekYear = d.date.split('-')[0]; // Get year from ISO string
          return date >= startDate && date <= endDate && 
                 parseInt(weekYear) === w.year && 
                 this.getWeekNumber(date) === w.weekNumber;
        });
      }),
      monthlySummary: this.report.monthlySummary.filter(m => {
        // Find any daily data in this month that falls within range
        return this.report.dailyBreakdown.some(d => {
          const date = new Date(d.date);
          return date >= startDate && date <= endDate && 
                 date.getFullYear() === m.year && 
                 date.getMonth() + 1 === m.month;
        });
      })
    };

    // Reset to first page and update pagination
    this.currentPage = 1;
    this.initializePagination();
  }

  resetDetailFilter(): void {
    if (!this.report) return;
    
    // Reset to original report dates
    this.detailStartDate = this.report.startDate.split('T')[0];
    this.detailEndDate = this.report.endDate.split('T')[0];
    
    // Reapply filter (which will show all data)
    this.applyDetailFilter();
  }

  getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }
}
