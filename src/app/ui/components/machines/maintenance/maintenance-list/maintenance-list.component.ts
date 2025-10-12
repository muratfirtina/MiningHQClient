import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { MaintenanceService } from 'src/app/services/common/models/maintenance.service';
import { MaintenanceTypeService } from 'src/app/services/common/models/maintenance-type.service';
import { MachineService } from 'src/app/services/common/models/machine.service';
import { Maintenance } from 'src/app/contracts/maintenance/maintenance';
import { MaintenanceType } from 'src/app/contracts/maintenance/maintenance-type';
import { Machine } from 'src/app/contracts/machine/machine';
import { PageRequest } from 'src/app/contracts/pageRequest';
import { switchMap } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomToastrService, ToastrMessageType, ToastrOptions, ToastrPosition } from 'src/app/services/common/custom-toastr.service';

@Component({
  selector: 'app-maintenance-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './maintenance-list.component.html',
  styleUrls: ['./maintenance-list.component.scss']
})
export class MaintenanceListComponent extends BaseComponent implements OnInit {
  maintenances: Maintenance[] = [];
  filteredMaintenances: Maintenance[] = [];
  maintenanceTypes: MaintenanceType[] = [];
  machine: Machine;
  machineId: string;
  isLoading: boolean = false;
  totalCount: number = 0;

  // Filter properties
  selectedMaintenanceType: string = '';
  startDate: string = '';
  endDate: string = '';
  firmFilter: string = '';
  showOnlyUpcoming: boolean = false;

  // Pagination
  pageRequest: PageRequest = {
    pageIndex: 0,
    pageSize: 100
  };

  constructor(
    spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private router: Router,
    private maintenanceService: MaintenanceService,
    private maintenanceTypeService: MaintenanceTypeService,
    private machineService: MachineService,
    private toastrService: CustomToastrService
  ) {
    super(spinner);
  }

  async ngOnInit(): Promise<void> {
    this.showSpinner(SpinnerType.BallSpinClockwise);
    
    try {
      // Load maintenance types first
      await this.loadMaintenanceTypes();
      
      // Get machine ID from route
      this.route.paramMap.pipe(
        switchMap(params => {
          this.machineId = params.get('machineId');
          return this.machineService.getById(this.machineId);
        })
      ).subscribe(async machine => {
        this.machine = machine;
        await this.loadMaintenances();
        this.hideSpinner(SpinnerType.BallSpinClockwise);
      });
      
    } catch (error) {
      console.error('Error loading data:', error);
      this.hideSpinner(SpinnerType.BallSpinClockwise);
    }
  }

  async loadMaintenanceTypes(): Promise<void> {
    try {
      const response = await this.maintenanceTypeService.list(0, 1000);
      this.maintenanceTypes = response.items || [];
    } catch (error) {
      console.error('Error loading maintenance types:', error);
      this.maintenanceTypes = [];
    }
  }

  async loadMaintenances(): Promise<void> {
    this.isLoading = true;
    
    try {
      this.maintenanceService.getByMachineId(this.machineId, this.pageRequest).subscribe(
        response => {
          this.maintenances = response.items || [];
          this.filteredMaintenances = [...this.maintenances];
          this.totalCount = response.count || 0;
          this.applyFilters();
          this.isLoading = false;
        },
        error => {
          console.error('Error loading maintenances:', error);
          this.maintenances = [];
          this.filteredMaintenances = [];
          this.isLoading = false;
        }
      );
    } catch (error) {
      console.error('Error:', error);
      this.isLoading = false;
    }
  }

  applyFilters(): void {
    let filtered = [...this.maintenances];

    // Maintenance Type Filter
    if (this.selectedMaintenanceType) {
      filtered = filtered.filter(m => 
        m.maintenanceTypeName === this.selectedMaintenanceType
      );
    }

    // Date Range Filter
    if (this.startDate) {
      const start = new Date(this.startDate);
      filtered = filtered.filter(m => new Date(m.maintenanceDate) >= start);
    }

    if (this.endDate) {
      const end = new Date(this.endDate);
      filtered = filtered.filter(m => new Date(m.maintenanceDate) <= end);
    }

    // Firm Filter
    if (this.firmFilter) {
      filtered = filtered.filter(m => 
        m.maintenanceFirm?.toLowerCase().includes(this.firmFilter.toLowerCase())
      );
    }

    // Upcoming Maintenance Filter
    if (this.showOnlyUpcoming) {
      const maxNextMaintenanceHour = this.getMaxNextMaintenanceHour();
      if (maxNextMaintenanceHour) {
        filtered = filtered.filter(m => m.nextMaintenanceHour === maxNextMaintenanceHour);
      } else {
        filtered = [];
      }
    }

    this.filteredMaintenances = filtered;
  }

  clearFilters(): void {
    this.selectedMaintenanceType = '';
    this.startDate = '';
    this.endDate = '';
    this.firmFilter = '';
    this.showOnlyUpcoming = false;
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!(this.selectedMaintenanceType || this.startDate || this.endDate || this.firmFilter || this.showOnlyUpcoming);
  }

  viewMaintenanceDetail(maintenance: Maintenance): void {
    this.router.navigate(['/makinalar/makina', this.machineId, 'bakim', maintenance.id]);
  }

  addMaintenance(): void {
    this.router.navigate(['/makinalar/makina', this.machineId, 'bakim-ekle']);
  }

  editMaintenance(maintenance: Maintenance): void {
    // TODO: Navigate to edit page
    this.toastrService.message(
      'Düzenleme özelliği yakında eklenecek',
      'Bilgi',
      new ToastrOptions(ToastrMessageType.Info, ToastrPosition.BottomRight)
    );
  }

  deleteMaintenance(maintenance: Maintenance): void {
    if (confirm('Bu bakım kaydını silmek istediğinizden emin misiniz?')) {
      // TODO: Implement delete
      this.toastrService.message(
        'Silme özelliği yakında eklenecek',
        'Bilgi',
        new ToastrOptions(ToastrMessageType.Info, ToastrPosition.BottomRight)
      );
    }
  }

  exportMaintenanceReport(): void {
    // TODO: Implement export
    this.toastrService.message(
      'Rapor alma özelliği yakında eklenecek',
      'Bilgi',
      new ToastrOptions(ToastrMessageType.Info, ToastrPosition.BottomRight)
    );
  }

  goBack(): void {
    this.router.navigate(['/makinalar/makina', this.machineId]);
  }

  // Statistics Methods
  getTotalMaintenances(): number {
    return this.maintenances.length;
  }

  getMaintenancesThisMonth(): number {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return this.maintenances.filter(m => new Date(m.maintenanceDate) >= firstDayOfMonth).length;
  }

  getMaintenancesThisYear(): number {
    const now = new Date();
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
    return this.maintenances.filter(m => new Date(m.maintenanceDate) >= firstDayOfYear).length;
  }

  getAverageDaysBetweenMaintenance(): number {
    if (this.maintenances.length < 2) return 0;
    
    const sortedDates = this.maintenances
      .map(m => new Date(m.maintenanceDate).getTime())
      .sort((a, b) => a - b);
    
    let totalDays = 0;
    for (let i = 1; i < sortedDates.length; i++) {
      totalDays += (sortedDates[i] - sortedDates[i - 1]) / (1000 * 60 * 60 * 24);
    }
    
    return Math.round(totalDays / (sortedDates.length - 1));
  }

  // Formatting Methods
  formatDate(date: Date): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('tr-TR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  formatDateTime(date: Date): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleString('tr-TR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Helper Methods
  getMaintenanceTypeIcon(typeName: string): string {
    const type = typeName?.toLowerCase();
    
    if (type?.includes('rutin') || type?.includes('periyodik')) {
      return 'fas fa-calendar-check';
    } else if (type?.includes('onarım') || type?.includes('arıza')) {
      return 'fas fa-wrench';
    } else if (type?.includes('acil')) {
      return 'fas fa-exclamation-triangle';
    }
    
    return 'fas fa-tools';
  }

  getMaintenanceTypeBadgeClass(typeName: string): string {
    const type = typeName?.toLowerCase();
    
    if (type?.includes('rutin') || type?.includes('periyodik')) {
      return 'badge-routine';
    } else if (type?.includes('onarım') || type?.includes('arıza')) {
      return 'badge-repair';
    } else if (type?.includes('acil')) {
      return 'badge-emergency';
    }
    
    return 'badge-default';
  }

  isUpcomingMaintenance(maintenance: Maintenance): boolean {
    if (!maintenance.nextMaintenanceHour || !this.machine?.currentWorkingHours) return false;
    
    // Get the maximum nextMaintenanceHour from all maintenances
    const maxNextMaintenanceHour = this.getMaxNextMaintenanceHour();
    
    // Only show warning for the maintenance with the maximum nextMaintenanceHour
    if (maintenance.nextMaintenanceHour !== maxNextMaintenanceHour) return false;
    
    const currentHour = this.machine.currentWorkingHours;
    const hoursRemaining = maintenance.nextMaintenanceHour - currentHour;
    return hoursRemaining <= 50 && hoursRemaining > 0;
  }

  isMaintenanceOverdue(maintenance: Maintenance): boolean {
    if (!maintenance.nextMaintenanceHour || !this.machine?.currentWorkingHours) return false;
    
    // Get the maximum nextMaintenanceHour from all maintenances
    const maxNextMaintenanceHour = this.getMaxNextMaintenanceHour();
    
    // Only show overdue for the maintenance with the maximum nextMaintenanceHour
    if (maintenance.nextMaintenanceHour !== maxNextMaintenanceHour) return false;
    
    const currentHour = this.machine.currentWorkingHours;
    const hoursRemaining = maintenance.nextMaintenanceHour - currentHour;
    return hoursRemaining < 0;
  }

  getMaxNextMaintenanceHour(): number | null {
    if (!this.maintenances || this.maintenances.length === 0) return null;
    
    const maintenancesWithNextHour = this.maintenances.filter(m => m.nextMaintenanceHour);
    if (maintenancesWithNextHour.length === 0) return null;
    
    return Math.max(...maintenancesWithNextHour.map(m => m.nextMaintenanceHour!));
  }

  getHoursUntilNextMaintenance(maintenance: Maintenance): number {
    if (!maintenance.nextMaintenanceHour || !this.machine?.currentWorkingHours) return -1;
    
    // Only calculate for the maintenance with maximum nextMaintenanceHour
    const maxNextMaintenanceHour = this.getMaxNextMaintenanceHour();
    if (maintenance.nextMaintenanceHour !== maxNextMaintenanceHour) return -1;
    
    const currentHour = this.machine.currentWorkingHours;
    return maintenance.nextMaintenanceHour - currentHour;
  }

  getOverdueHours(maintenance: Maintenance): number {
    if (!maintenance.nextMaintenanceHour || !this.machine?.currentWorkingHours) return 0;
    
    const currentHour = this.machine.currentWorkingHours;
    const hoursRemaining = maintenance.nextMaintenanceHour - currentHour;
    return hoursRemaining < 0 ? Math.abs(hoursRemaining) : 0;
  }

  getHoursRemainingForNextMaintenance(): number | null {
    const maxNextHour = this.getMaxNextMaintenanceHour();
    if (!maxNextHour || !this.machine?.currentWorkingHours) return null;
    
    return maxNextHour - this.machine.currentWorkingHours;
  }

  getAbsoluteHoursRemaining(): number {
    const remaining = this.getHoursRemainingForNextMaintenance();
    return remaining !== null ? Math.abs(remaining) : 0;
  }

  trackByMaintenanceId(index: number, maintenance: Maintenance): string {
    return maintenance.id;
  }
}
