import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { MachineService } from 'src/app/services/common/models/machine.service';
import { Machine } from 'src/app/contracts/machine/machine';
import { MachinePerformanceReport } from 'src/app/contracts/machine/machine-performance-report';
import { GetListResponse } from 'src/app/contracts/getListResponse';

interface MachineWithReport extends Machine {
  performanceReport?: MachinePerformanceReport;
  isLoadingReport?: boolean;
}

@Component({
  selector: 'app-machine-reports',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './machine-reports.component.html',
  styleUrls: ['./machine-reports.component.scss']
})
export class MachineReportsComponent extends BaseComponent implements OnInit {
  
  machines: MachineWithReport[] = [];
  filteredMachines: MachineWithReport[] = [];
  
  // Filters
  selectedBrand: string = '';
  selectedMachineType: string = '';
  selectedQuarry: string = '';
  searchTerm: string = '';
  
  // Filter Options
  brands: string[] = [];
  machineTypes: string[] = [];
  quarries: string[] = [];
  
  // State
  isLoading: boolean = false;
  selectedPeriod: 'weekly' | 'monthly' | 'yearly' = 'monthly';
  
  // Sort
  sortBy: 'name' | 'workingHours' | 'fuelConsumption' | 'efficiency' = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Summary Statistics
  totalMachines: number = 0;
  totalWorkingHours: number = 0;
  totalFuelConsumption: number = 0;
  averageEfficiency: number = 0;

  constructor(
    spinner: NgxSpinnerService,
    private machineService: MachineService,
    private router: Router
  ) {
    super(spinner);
  }

  async ngOnInit(): Promise<void> {
    this.showSpinner(SpinnerType.BallSpinClockwise);
    
    try {
      await this.loadMachinesWithReports();
      this.extractFilterOptions();
      this.calculateSummaryStats();
    } catch (error) {
      console.error('Error loading machines:', error);
    } finally {
      this.hideSpinner(SpinnerType.BallSpinClockwise);
    }
  }

  /**
   * Load all machines and their performance reports
   */
  async loadMachinesWithReports(): Promise<void> {
    this.isLoading = true;
    
    try {
      // Load all machines
      const response: GetListResponse<Machine> = await this.machineService.list(0, 100);
      this.machines = response.items.map(machine => ({
        ...machine,
        isLoadingReport: false
      }));
      
      // Load performance reports for each machine
      await Promise.all(
        this.machines.map(async (machine) => {
          try {
            machine.isLoadingReport = true;
            machine.performanceReport = await this.machineService.getMachinePerformanceReport(machine.id);
          } catch (error) {
            console.error(`Error loading report for machine ${machine.id}:`, error);
          } finally {
            machine.isLoadingReport = false;
          }
        })
      );
      
      this.filteredMachines = [...this.machines];
      this.sortMachines();
      
    } catch (error) {
      console.error('Error loading machines:', error);
      this.machines = [];
      this.filteredMachines = [];
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Extract unique filter options from machines
   */
  extractFilterOptions(): void {
    this.brands = [...new Set(this.machines.map(m => m.brandName).filter(b => b))];
    this.machineTypes = [...new Set(this.machines.map(m => m.machineTypeName).filter(t => t))];
    this.quarries = [...new Set(this.machines.map(m => m.quarryName).filter(q => q))];
  }

  /**
   * Apply filters to machines
   */
  applyFilters(): void {
    this.filteredMachines = this.machines.filter(machine => {
      const matchesBrand = !this.selectedBrand || machine.brandName === this.selectedBrand;
      const matchesType = !this.selectedMachineType || machine.machineTypeName === this.selectedMachineType;
      const matchesQuarry = !this.selectedQuarry || machine.quarryName === this.selectedQuarry;
      const matchesSearch = !this.searchTerm || 
        machine.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        machine.serialNumber?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesBrand && matchesType && matchesQuarry && matchesSearch;
    });
    
    this.sortMachines();
    this.calculateSummaryStats();
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.selectedBrand = '';
    this.selectedMachineType = '';
    this.selectedQuarry = '';
    this.searchTerm = '';
    this.applyFilters();
  }

  /**
   * Sort machines based on selected criteria
   */
  sortMachines(): void {
    this.filteredMachines.sort((a, b) => {
      let valueA: any;
      let valueB: any;
      
      switch (this.sortBy) {
        case 'name':
          valueA = a.name?.toLowerCase() || '';
          valueB = b.name?.toLowerCase() || '';
          break;
        case 'workingHours':
          valueA = this.getPeriodData(a)?.totalWorkingHours || 0;
          valueB = this.getPeriodData(b)?.totalWorkingHours || 0;
          break;
        case 'fuelConsumption':
          valueA = this.getPeriodData(a)?.totalFuelConsumption || 0;
          valueB = this.getPeriodData(b)?.totalFuelConsumption || 0;
          break;
        case 'efficiency':
          valueA = this.calculateEfficiency(a);
          valueB = this.calculateEfficiency(b);
          break;
        default:
          return 0;
      }
      
      if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Change sort criteria
   */
  changeSorting(sortBy: 'name' | 'workingHours' | 'fuelConsumption' | 'efficiency'): void {
    if (this.sortBy === sortBy) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = sortBy;
      this.sortDirection = 'asc';
    }
    this.sortMachines();
  }

  /**
   * Change selected period
   */
  selectPeriod(period: 'weekly' | 'monthly' | 'yearly'): void {
    this.selectedPeriod = period;
    this.sortMachines();
    this.calculateSummaryStats();
  }

  /**
   * Get performance data for selected period
   */
  getPeriodData(machine: MachineWithReport): any {
    if (!machine.performanceReport) return null;
    
    switch (this.selectedPeriod) {
      case 'weekly':
        return machine.performanceReport.weeklyPerformance;
      case 'monthly':
        return machine.performanceReport.monthlyPerformance;
      case 'yearly':
        return machine.performanceReport.yearlyPerformance;
      default:
        return machine.performanceReport.monthlyPerformance;
    }
  }

  /**
   * Calculate fuel efficiency (L/hour)
   */
  calculateEfficiency(machine: MachineWithReport): number {
    const periodData = this.getPeriodData(machine);
    if (!periodData || periodData.totalWorkingHours === 0) return 0;
    return periodData.totalFuelConsumption / periodData.totalWorkingHours;
  }

  /**
   * Calculate summary statistics
   */
  calculateSummaryStats(): void {
    this.totalMachines = this.filteredMachines.length;
    this.totalWorkingHours = 0;
    this.totalFuelConsumption = 0;
    let totalEfficiency = 0;
    let machinesWithData = 0;

    this.filteredMachines.forEach(machine => {
      const periodData = this.getPeriodData(machine);
      if (periodData) {
        this.totalWorkingHours += periodData.totalWorkingHours || 0;
        this.totalFuelConsumption += periodData.totalFuelConsumption || 0;
        
        const efficiency = this.calculateEfficiency(machine);
        if (efficiency > 0) {
          totalEfficiency += efficiency;
          machinesWithData++;
        }
      }
    });

    this.averageEfficiency = machinesWithData > 0 ? totalEfficiency / machinesWithData : 0;
  }

  /**
   * Get period label
   */
  getPeriodLabel(): string {
    switch (this.selectedPeriod) {
      case 'weekly':
        return 'Haftalık';
      case 'monthly':
        return 'Aylık';
      case 'yearly':
        return 'Yıllık';
      default:
        return 'Aylık';
    }
  }

  /**
   * Navigate to machine details
   */
  viewMachineDetails(machine: Machine): void {
    this.router.navigate(['/makinalar/makina', machine.id]);
  }

  /**
   * Navigate back to machines list
   */
  goBack(): void {
    this.router.navigate(['/makinalar']);
  }

  /**
   * Get machine icon based on type
   */
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

  /**
   * Track by function for performance
   */
  trackByMachineId(index: number, machine: MachineWithReport): string {
    return machine.id;
  }

  /**
   * Export reports to CSV or PDF (placeholder)
   */
  exportReports(format: 'csv' | 'pdf'): void {
    console.log(`Exporting reports in ${format} format...`);
    // Implement export logic
  }
}
