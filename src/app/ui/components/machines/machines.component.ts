import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { DynamicQuery, Filter, Sort } from 'src/app/contracts/dynamic-query';
import { MachineService } from 'src/app/services/common/models/machine.service';
import { ListMachine } from 'src/app/contracts/machine/list-machine';
import { Machine } from 'src/app/contracts/machine/machine';
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
  machines: ListMachine;
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
    } catch (error) {
      console.error('Makina listesi yüklenirken hata:', error);
      this.machines = { items: [], count: 0 } as ListMachine;
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
   * Search machines with filters
   */
  async searchMachines(): Promise<void> {
    if (this.isSearching) return;
    
    if (!this.filter.field || !this.filter.operator || !this.filter.value) {
      await this.loadAllMachines();
      return;
    }

    this.isSearching = true;
    this.isLoading = true;

    try {
      const filters: Filter[] = [];

      // Add main search filter
      if (this.filter.value.trim()) {
        filters.push({
          field: this.filter.field,
          operator: this.filter.operator,
          value: this.filter.value.trim()
        });
      }

      // Add additional filters
      if (this.selectedBrand) {
        filters.push({
          field: 'brandName',
          operator: 'eq',
          value: this.selectedBrand
        });
      }

      if (this.selectedQuarry) {
        filters.push({
          field: 'quarryName',
          operator: 'eq',
          value: this.selectedQuarry
        });
      }

      if (this.selectedMachineType) {
        filters.push({
          field: 'machineTypeName',
          operator: 'eq',
          value: this.selectedMachineType
        });
      }

      // Combine filters
      let dynamicFilter: Filter | undefined;
      if (filters.length > 0) {
        dynamicFilter = filters.length === 1 ? filters[0] : {
          field: "",
          operator: "",
          logic: "and",
          filters: filters
        };
      }

      const dynamicQuery: DynamicQuery = {
        filter: dynamicFilter,
        sort: [{ field: 'name', dir: 'asc' }]
      };

      const data = await this.machineService.search(dynamicQuery);
      this.machines = data;
    } catch (error) {
      console.error('Makina arama hatası:', error);
      this.machines = { items: [], count: 0 } as ListMachine;
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
   * Navigation and action methods
   */
  viewMachineDetails(machine: Machine): void {
    console.log('Makina detayları:', machine);
    // TODO: Navigate to machine detail page
    // this.router.navigate(['/machines', machine.id]);
  }

  editMachine(machine: Machine): void {
    console.log('Makina düzenleme:', machine);
    // TODO: Navigate to machine edit page
    // this.router.navigate(['/admin/machines/edit', machine.id]);
  }

  viewMachineMaintenance(machine: Machine): void {
    console.log('Makina bakım geçmişi:', machine);
    // TODO: Navigate to maintenance history
    // this.router.navigate(['/machines', machine.id, 'maintenance']);
  }

  addNewMachine(): void {
    console.log('Yeni makina ekleme');
    // TODO: Navigate to machine creation page
    // this.router.navigate(['/admin/machines/add']);
  }

  viewMachineReports(): void {
    console.log('Makina raporları');
    // TODO: Navigate to machine reports
    // this.router.navigate(['/reports/machines']);
  }

  viewMaintenanceSchedule(): void {
    console.log('Bakım takvimi');
    // TODO: Navigate to maintenance schedule
    // this.router.navigate(['/maintenance/schedule']);
  }

  exportData(): void {
    console.log('Veri dışa aktarma');
    // TODO: Implement export functionality
  }

  /**
   * Helper methods
   */
  isFeaturedMachine(machine: Machine): boolean {
    return machine.brandName?.toLowerCase().includes('caterpillar') || 
           machine.brandName?.toLowerCase().includes('cat') ||
           machine.brandName?.toLowerCase().includes('komatsu') ||
           machine.brandName?.toLowerCase().includes('volvo');
  }

  trackByMachineId(index: number, machine: Machine): string {
    return machine.id;
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
}