import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaintenanceService } from 'src/app/services/common/models/maintenance.service';
import { MaintenanceSchedule } from 'src/app/contracts/maintenance/maintenance-schedule';
import { PageRequest } from 'src/app/contracts/pageRequest';
import { GetListResponse } from 'src/app/contracts/getListResponse';
import { RouterModule } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-maintenance-schedule',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './maintenance-schedule.component.html',
  styleUrls: ['./maintenance-schedule.component.scss']
})
export class MaintenanceScheduleComponent implements OnInit {
  schedules: MaintenanceSchedule[] = [];
  currentPageNo: number = 1;
  totalCount: number = 0;
  pageSize: number = 50;
  pages: number = 0;
  pageList: number[] = [];

  constructor(
    private maintenanceService: MaintenanceService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.loadMaintenanceSchedule();
  }

  loadMaintenanceSchedule(): void {
    this.spinner.show();
    
    const pageRequest: PageRequest = {
      pageIndex: this.currentPageNo - 1,
      pageSize: this.pageSize
    };

    this.maintenanceService.getMaintenanceSchedule(pageRequest).subscribe({
      next: (response: GetListResponse<MaintenanceSchedule>) => {
        this.schedules = response.items;
        this.totalCount = response.count;
        this.pages = response.pages;
        this.currentPageNo = response.index + 1;
        
        // Sayfa listesini oluştur
        this.pageList = [];
        const startPage = Math.max(1, this.currentPageNo - 2);
        const endPage = Math.min(this.pages, this.currentPageNo + 2);
        
        for (let i = startPage; i <= endPage; i++) {
          this.pageList.push(i);
        }
        
        this.spinner.hide();
      },
      error: (error) => {
        console.error('Bakım takvimi yüklenirken hata:', error);
        this.spinner.hide();
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Gecikmiş':
        return 'status-overdue';
      case 'Yaklaşıyor':
        return 'status-upcoming';
      case 'Normal':
        return 'status-normal';
      default:
        return '';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Gecikmiş':
        return 'badge bg-danger';
      case 'Yaklaşıyor':
        return 'badge bg-warning text-dark';
      case 'Normal':
        return 'badge bg-success';
      default:
        return 'badge bg-secondary';
    }
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('tr-TR');
  }

  goToPage(pageNo: number): void {
    this.currentPageNo = pageNo;
    this.loadMaintenanceSchedule();
  }
}
