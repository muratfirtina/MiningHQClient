import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { DynamicQuery, Filter, Sort } from 'src/app/contracts/dynamic-query';
import { MachineService } from 'src/app/services/common/models/machine.service';
import { Machine } from 'src/app/contracts/machine/machine';
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
    console.log('Navigate to machine reports');
    // this.router.navigate(['/makinalar/raporlar']);
  }

  viewMaintenanceSchedule(): void {
    console.log('Navigate to maintenance schedule');
    // this.router.navigate(['/makinalar/bakim-takvimi']);
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
    console.log('Makina düzenleme:', machine);
    this.router.navigate(['/makinalar/makina-duzenle', machine.id]);
  }

  viewMachineMaintenance(machine: Machine): void {
    console.log('Makina bakım geçmişi:', machine);
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
}
