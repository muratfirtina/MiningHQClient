import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { List_LeaveType, LeaveTypeService } from 'src/app/services/common/models/leave-type.service';

declare var $: any;

@Component({
  selector: 'app-leave-type-list',
  standalone: true,
  imports: [NgFor, NgIf, CommonModule, RouterLink],
  templateUrl: './leave-type-list.component.html',
  styleUrls: ['./leave-type-list.component.scss']
})
export class LeaveTypeListComponent implements OnInit {

  leaveTypes: List_LeaveType[] = [];
  currentPageNo: number = 1;
  totalLeaveTypeCount: number = 0;
  totalPageCount: number = 0;
  totalPagesCount: number = 0;
  pageSize: number = 5;
  count: number = 0;
  pageList: number[] = [];
  isLoading: boolean = false;

  constructor(
    private leaveTypeService: LeaveTypeService,
    private activatedRoute: ActivatedRoute
  ) { }

  async ngOnInit(): Promise<void> {
    this.activatedRoute.params.subscribe(async params => {
      this.currentPageNo = parseInt(params["pageNo"] ?? 1);
      await this.getLeaveTypes();
    });
  }

  async getLeaveTypes() {
    this.isLoading = true;
    try {
      const allData: { totalLeaveTypeCount: number; leaveTypes: List_LeaveType[] } = 
        await this.leaveTypeService.read(this.currentPageNo - 1, this.pageSize, 
          () => {
            // Success callback
          }, 
          errorMessage => {
            console.error('İzin türleri yüklenirken hata oluştu:', errorMessage);
          }
        );

      this.leaveTypes = allData.leaveTypes;
      this.totalLeaveTypeCount = allData.totalLeaveTypeCount;
      this.totalPageCount = Math.ceil(this.totalLeaveTypeCount / this.pageSize);
      this.totalPagesCount = this.totalPageCount;
      this.count = Math.ceil(this.totalLeaveTypeCount / this.pageSize);

      this.pageList = [];
      if (this.count > 1) {
        for (let i = 1; i <= this.count; i++) {
          this.pageList.push(i);
        }
      }
    } catch (error) {
      console.error('İzin türleri yüklenirken hata oluştu:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async delete(id: string, name: string) {
    if (confirm(`"${name}" adlı izin türünü silmek istediğinizden emin misiniz?`)) {
      this.isLoading = true;
      try {
        await this.leaveTypeService.delete(id,
          () => {
            console.log('İzin türü başarıyla silindi');
            this.getLeaveTypes(); // Listeyi yenile
          },
          errorMessage => {
            console.error('İzin türü silinirken hata oluştu:', errorMessage);
            alert('İzin türü silinirken bir hata oluştu: ' + errorMessage);
          }
        );
      } catch (error) {
        console.error('İzin türü silinirken hata oluştu:', error);
        alert('İzin türü silinirken bir hata oluştu.');
      } finally {
        this.isLoading = false;
      }
    }
  }

  openEditModal(leaveType: List_LeaveType) {
    // Edit modal açma işlemi - şimdilik console.log
    console.log('Edit modal açılacak:', leaveType);
  }

  openAddModal() {
    try {
      const modalElement = document.getElementById('leaveTypeAddModal');
      if (modalElement && (window as any).bootstrap) {
        const modal = new (window as any).bootstrap.Modal(modalElement);
        modal.show();
      }
    } catch (error) {
      console.warn('Modal açılırken hata oluştu:', error);
    }
  }

  // Pagination methods
  isPreviousDisabled(): boolean {
    return this.currentPageNo === 1;
  }

  isNextDisabled(): boolean {
    return this.currentPageNo === this.totalPageCount;
  }

  getPreviousPage(): number {
    return this.currentPageNo > 1 ? this.currentPageNo - 1 : 1;
  }

  getNextPage(): number {
    return this.currentPageNo < this.totalPageCount ? this.currentPageNo + 1 : this.totalPageCount;
  }

  goToPreviousPage(): number {
    return this.getPreviousPage();
  }

  goToNextPage(): number {
    return this.getNextPage();
  }
}