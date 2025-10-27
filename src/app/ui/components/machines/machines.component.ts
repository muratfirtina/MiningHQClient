import { Component, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { DynamicQuery, Filter, Sort } from 'src/app/contracts/dynamic-query';
import { MachineService } from 'src/app/services/common/models/machine.service';
import { Machine } from 'src/app/contracts/machine/machine';
import { MachinePerformanceReport, PerformancePeriod } from 'src/app/contracts/machine/machine-performance-report';
import { GetListResponse } from 'src/app/contracts/getListResponse';
import { from } from 'rxjs';

// Additional services for filters
import { BrandService } from 'src/app/services/common/models/brand.service';
import { QuarryService } from 'src/app/services/common/models/quarry.service';
import { MachineTypeService } from 'src/app/services/common/models/machine-type.service';

// Contracts
import { Brand } from 'src/app/contracts/brand/brand';
import { Quarry } from 'src/app/contracts/quarry/quarry';
import { MachineType } from 'src/app/contracts/machine-type/machine-type';

// Angular Common Imports
import { NgFor, NgIf, CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-machines',
  templateUrl: './machines.component.html',
  styleUrls: ['./machines.component.scss'],
  standalone: true,
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ height: '0', opacity: '0', overflow: 'hidden' }),
        animate('300ms ease-out', style({ height: '*', opacity: '1' }))
      ]),
      transition(':leave', [
        style({ height: '*', opacity: '1', overflow: 'hidden' }),
        animate('200ms ease-in', style({ height: '0', opacity: '0' }))
      ])
    ])
  ],
  imports: [
    CommonModule,
    NgFor,
    NgIf,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ],
})
export class MachinesComponent extends BaseComponent implements OnInit {
  // Search filter
  filter: Filter = {
    field: 'name',
    operator: 'contains',
    value: ''
  };
  
  // Data
  machines: GetListResponse<Machine> = { items: [], count: 0, index: 0, size: 0, pages: 0, hasPrevious: false, hasNext: false };
  brands: Brand[] = [];
  quarries: Quarry[] = [];
  machineTypes: MachineType[] = [];
  
  // Filter selections
  selectedBrand: string = '';
  selectedQuarry: string = '';
  selectedMachineType: string = '';
  
  // State
  isLoading: boolean = false;
  isSearching: boolean = false;
  
  // Performance Report State
  expandedMachineId: string | null = null;
  machinePerformanceData: Map<string, MachinePerformanceReport> = new Map();
  selectedPeriod: 'weekly' | 'monthly' | 'yearly' = 'weekly';
  loadingPerformance: boolean = false;

  constructor(
    spinner: NgxSpinnerService, 
    private machineService: MachineService,
    private brandService: BrandService,
    private quarryService: QuarryService,
    private machineTypeService: MachineTypeService,
    private router: Router
  ) {
    super(spinner);
  }

  async ngOnInit(): Promise<void> {
    this.showSpinner(SpinnerType.BallSpinClockwise);
    
    try {
      await Promise.all([
        this.loadBrands(),
        this.loadQuarries(),
        this.loadMachineTypes()
      ]);
      
      // Initial load of all machines
      await this.loadAllMachines();
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      this.hideSpinner(SpinnerType.BallSpinClockwise);
    }
  }

  /**
   * Load all machines without filters
   */
  async loadAllMachines(): Promise<void> {
    this.isLoading = true;
    
    try {
      const data = await this.machineService.list(0, 100);
      this.machines = data;
      
      if (this.machines?.items?.length > 0) {
        console.log(`${this.machines.items.length} makina yüklendi`);
      } else {
        console.warn('Hiç makina bulunamadı');
      }
    } catch (error) {
      console.error('Makina listesi yüklenirken hata:', error);
      this.machines = { items: [], count: 0, index: 0, size: 0, pages: 0, hasPrevious: false, hasNext: false };
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Load brands for filter dropdown
   */
  async loadBrands(): Promise<void> {
    try {
      const response = await this.brandService.list(-1, -1);
      this.brands = response.items || [];
    } catch (error) {
      console.error('Error loading brands:', error);
      this.brands = [];
    }
  }

  /**
   * Load quarries for filter dropdown
   */
  async loadQuarries(): Promise<void> {
    try {
      const response = await this.quarryService.list(-1, -1);
      this.quarries = response.items || [];
    } catch (error) {
      console.error('Error loading quarries:', error);
      this.quarries = [];
    }
  }

  /**
   * Load machine types for filter dropdown
   */
  async loadMachineTypes(): Promise<void> {
    try {
      const response = await this.machineTypeService.list(-1, -1);
      this.machineTypes = response.items || [];
    } catch (error) {
      console.error('Error loading machine types:', error);
      this.machineTypes = [];
    }
  }

  /**
   * Search machines with current filter
   */
  async searchMachines(): Promise<void> {
    if (!this.filter.value || this.filter.value.trim() === '') {
      await this.loadAllMachines();
      return;
    }

    this.isLoading = true;
    this.isSearching = true;

    try {
      const sort: Sort = {
        field: 'name',
        dir: 'asc'
      };

      const dynamicQuery: DynamicQuery = {
        filter: this.filter,
        sort: [sort]
      };

      const data = await this.machineService.search(dynamicQuery);
      this.machines = data;
    } catch (error) {
      console.error('Makina arama hatası:', error);
      this.machines = { items: [], count: 0, index: 0, size: 0, pages: 0, hasPrevious: false, hasNext: false };
    } finally {
      this.isLoading = false;
      this.isSearching = false;
    }
  }

  /**
   * Clear all filters and reload machines
   */
  clearFilters(): void {
    this.filter = {
      field: 'name',
      operator: 'contains',
      value: ''
    };
    this.selectedBrand = '';
    this.selectedQuarry = '';
    this.selectedMachineType = '';
    this.loadAllMachines();
  }

  /**
   * Navigation Methods
   */
  viewMachineReports(): void {
    // Navigate to a dedicated reports page if needed in the future
    console.log('Navigate to machine reports page');
    // this.router.navigate(['/makinalar/raporlar']);
  }

  gotoDailyEntry(): void {
    this.router.navigate(['/makinalar/makina-puantaji']);
  }

  viewMaintenanceSchedule(): void {
    this.router.navigate(['/makinalar/bakim-takvimi']);
  }

  addNewMachine(): void {
    this.router.navigate(['/makinalar/makina-ekle']);
  }

  /**
   * Machine Actions
   */
  viewMachineDetails(machine: Machine): void {
    this.router.navigate(['/makinalar/makina', machine.id]);
  }

  editMachine(machine: Machine): void {
    this.router.navigate(['/makinalar/makina-duzenle', machine.id]);
  }

  viewMachineMaintenance(machine: Machine): void {
    this.router.navigate(['/makinalar/makina', machine.id, 'bakim']);
  }

  /**
   * Utility Methods
   */
  exportData(): void {
    console.log('Export data functionality');
  }

  trackByMachineId(index: number, machine: Machine): string {
    return machine.id;
  }

  isFeaturedMachine(machine: Machine): boolean {
    return machine.brandName?.toLowerCase().includes('caterpillar') || 
           machine.brandName?.toLowerCase().includes('cat') ||
           machine.brandName?.toLowerCase().includes('komatsu') ||
           machine.brandName?.toLowerCase().includes('volvo');
  }

  getDisplayRange(): string {
    if (!this.machines?.items?.length) {
      return '0';
    }
    
    const start = 1;
    const end = this.machines.items.length;
    
    return `${start}-${end}`;
  }

  getMachineIcon(machineType: string): string {
    const type = machineType?.toLowerCase();
    
    if (type?.includes('ekskavatör') || type?.includes('excavator')) {
      return 'fas fa-tractor';
    } else if (type?.includes('kamyon') || type?.includes('truck') || type?.includes('damperli')) {
      return 'fas fa-truck';
    } else if (type?.includes('dozer') || type?.includes('bulldozer')) {
      return 'fas fa-bulldozer';
    } else if (type?.includes('loader') || type?.includes('yükleyici')) {
      return 'fas fa-truck-loading';
    } else if (type?.includes('greyder') || type?.includes('grader')) {
      return 'fas fa-road';
    } else if (type?.includes('kompaktör') || type?.includes('silindir')) {
      return 'fas fa-drum-steelpan';
    }
    
    return 'fas fa-cogs';
  }

  getMachineStatusColor(machine: Machine): string {
    return this.isFeaturedMachine(machine) ? 'featured' : 'default';
  }

  /**
   * Get current time formatted
   */
  getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  }

  /**
   * Check if machine needs maintenance warning (50 hours or less)
   */
  needsMaintenanceWarning(machine: Machine): boolean {
    if (!machine.currentWorkingHours || !machine.nextMaintenanceHour) {
      return false;
    }
    
    const remainingHours = machine.nextMaintenanceHour - machine.currentWorkingHours;
    return remainingHours <= 50 && remainingHours > 0;
  }

  /**
   * Check if maintenance is overdue (past the scheduled maintenance hour)
   */
  isMaintenanceOverdue(machine: Machine): boolean {
    if (!machine.currentWorkingHours || !machine.nextMaintenanceHour) {
      return false;
    }
    
    const remainingHours = machine.nextMaintenanceHour - machine.currentWorkingHours;
    return remainingHours < 0;
  }

  /**
   * Get remaining hours until next maintenance
   */
  getMaintenanceRemainingHours(machine: Machine): number {
    if (!machine.currentWorkingHours || !machine.nextMaintenanceHour) {
      return 0;
    }
    
    return machine.nextMaintenanceHour - machine.currentWorkingHours;
  }

  /**
   * Get overdue hours (absolute value)
   */
  getMaintenanceOverdueHours(machine: Machine): number {
    if (!machine.currentWorkingHours || !machine.nextMaintenanceHour) {
      return 0;
    }
    
    const remainingHours = machine.nextMaintenanceHour - machine.currentWorkingHours;
    return remainingHours < 0 ? Math.abs(remainingHours) : 0;
  }

  /**
   * Get maintenance status class
   */
  getMaintenanceStatusClass(machine: Machine): string {
    if (!machine.currentWorkingHours || !machine.nextMaintenanceHour) {
      return '';
    }
    
    const remainingHours = machine.nextMaintenanceHour - machine.currentWorkingHours;
    
    if (remainingHours < 0) {
      return 'maintenance-overdue';
    } else if (remainingHours <= 50) {
      return 'maintenance-warning';
    }
    
    return '';
  }

  /**
   * Get maintenance warning/overdue message
   */
  getMaintenanceMessage(machine: Machine): string {
    if (this.isMaintenanceOverdue(machine)) {
      const overdueHours = this.getMaintenanceOverdueHours(machine);
      return `${overdueHours} saat gecikti`;
    } else if (this.needsMaintenanceWarning(machine)) {
      const remainingHours = this.getMaintenanceRemainingHours(machine);
      return `${remainingHours} saat sonra bakım`;
    }
    return '';
  }

  /**
   * Performance Report Methods
   */
  async toggleMachineReport(machine: Machine, event: Event): Promise<void> {
    event.stopPropagation();
    
    if (this.expandedMachineId === machine.id) {
      this.expandedMachineId = null;
      return;
    }
    
    this.expandedMachineId = machine.id;
    
    // Check if we already have the data
    if (!this.machinePerformanceData.has(machine.id)) {
      await this.loadMachinePerformance(machine.id);
    }
  }

  async loadMachinePerformance(machineId: string): Promise<void> {
    this.loadingPerformance = true;
    
    try {
      const report = await this.machineService.getMachinePerformanceReport(machineId);
      this.machinePerformanceData.set(machineId, report);
    } catch (error) {
      console.error('Error loading machine performance:', error);
    } finally {
      this.loadingPerformance = false;
    }
  }

  isMachineExpanded(machineId: string): boolean {
    return this.expandedMachineId === machineId;
  }

  getMachinePerformance(machineId: string): MachinePerformanceReport | undefined {
    return this.machinePerformanceData.get(machineId);
  }

  getSelectedPeriodData(report: MachinePerformanceReport): PerformancePeriod {
    switch (this.selectedPeriod) {
      case 'weekly':
        return report.weeklyPerformance;
      case 'monthly':
        return report.monthlyPerformance;
      case 'yearly':
        return report.yearlyPerformance;
      default:
        return report.weeklyPerformance;
    }
  }

  selectPeriod(period: 'weekly' | 'monthly' | 'yearly'): void {
    this.selectedPeriod = period;
  }

  getPeriodLabel(): string {
    switch (this.selectedPeriod) {
      case 'weekly':
        return 'Haftalık';
      case 'monthly':
        return 'Aylık';
      case 'yearly':
        return 'Yıllık';
      default:
        return 'Haftalık';
    }
  }
}
