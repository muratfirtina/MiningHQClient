import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { MachineService } from 'src/app/services/common/models/machine.service';
import { PageRequest } from 'src/app/contracts/pageRequest';
import { Machine } from 'src/app/contracts/machine/machine';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GetListResponse } from 'src/app/contracts/getListResponse';


@Component({
  selector: 'app-machine-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './machine-list.component.html',
  styleUrls: ['./machine-list.component.scss', '../../../../../styles.scss'],
})
export class MachineListComponent extends BaseComponent implements OnInit {
  
  pageRequest: PageRequest = { pageIndex: -1, pageSize: -1 };

  listMachines: GetListResponse<Machine>[] = [];
  items: Machine[] = [];
  originalItems: Machine[] = [];
  isLoading: boolean = false; // Loading state

  
  constructor(
    spinner: NgxSpinnerService,
    private machineService: MachineService,
    private router: Router
  ) {
    super(spinner);
  }

  async ngOnInit() {
    await this.getAllMachines();
    this.originalItems = [...this.items]; 
  }

  async getAllMachines() {
    this.isLoading = true;
    this.showSpinner(SpinnerType.BallSpinClockwise);
    
    try {
      const response = await this.machineService.list(this.pageRequest.pageIndex, this.pageRequest.pageSize);
      this.items = response.items;
      this.originalItems = [...this.items];
    } catch (error) {
      console.error('Makina listesi yüklenirken hata:', error);
    } finally {
      this.isLoading = false;
      this.hideSpinner(SpinnerType.BallSpinClockwise);
    }
  }

  goToMachinePage(id: string) {
    this.router.navigate(['/makinalar/makina', id]);
  }

  searchMachines(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
  
    if (!searchTerm) {
      this.items = [...this.originalItems];
    } else {
      this.items = this.originalItems.filter(machine =>
        machine.name?.toLowerCase().includes(searchTerm) ||
        machine.serialNumber?.toLowerCase().includes(searchTerm) ||
        machine.brandName?.toLowerCase().includes(searchTerm) ||
        machine.modelName?.toLowerCase().includes(searchTerm) ||
        machine.machineTypeName?.toLowerCase().includes(searchTerm) ||
        machine.quarryName?.toLowerCase().includes(searchTerm) ||
        machine.id.toString().toLowerCase() === searchTerm
      );
    }
  }

  /**
   * Get machine icon based on type
   */
  getMachineIcon(machineTypeName: string): string {
    const type = machineTypeName?.toLowerCase();
    
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
   * Check if machine is featured (premium brands)
   */
  isFeaturedMachine(machine: Machine): boolean {
    return machine.brandName?.toLowerCase().includes('caterpillar') || 
           machine.brandName?.toLowerCase().includes('cat') ||
           machine.brandName?.toLowerCase().includes('komatsu') ||
           machine.brandName?.toLowerCase().includes('volvo');
  }

  /**
   * Navigate to machine add page
   */
  addNewMachine(): void {
    this.router.navigate(['/makinalar/makina-ekle']);
  }

  /**
   * Edit machine
   */
  editMachine(machine: Machine, event: Event): void {
    event.stopPropagation();
    console.log('Makina düzenleme:', machine);
    this.router.navigate(['/admin/machines/edit', machine.id]);
  }

  /**
   * View machine maintenance
   */
  viewMachineMaintenance(machine: Machine, event: Event): void {
    event.stopPropagation();
    console.log('Makina bakım geçmişi:', machine);
    this.router.navigate(['/makinalar/makina', machine.id, 'bakim']);
  }

  /**
   * View machine reports
   */
  viewMachineReports(): void {
    console.log('Navigate to machine reports');
    // this.router.navigate(['/makinalar/raporlar']);
  }

  /**
   * View maintenance schedule
   */
  viewMaintenanceSchedule(): void {
    console.log('Navigate to maintenance schedule');
    // this.router.navigate(['/makinalar/bakim-takvimi']);
  }

  /**
   * Clear search input and reset items
   */
  clearSearch(): void {
    this.items = [...this.originalItems];
    // Clear search input
    const searchInput = document.querySelector('.search-input') as HTMLInputElement;
    if (searchInput) {
      searchInput.value = '';
    }
  }

  /**
   * Track by function for ngFor performance
   */
  trackByMachineId(index: number, machine: Machine): string {
    return machine.id;
  }
}
