import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListDepartment } from 'src/app/contracts/department/listDepartment';
import { Department } from 'src/app/contracts/department/department';
import { DepartmentService } from 'src/app/services/common/models/department.service';
import { GetListResponse } from 'src/app/contracts/getListResponse';
import { PageRequest } from 'src/app/contracts/pageRequest';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './department-list.component.html',
  styleUrls: ['./department-list.component.scss','../../../../../styles.scss']
})
export class DepartmentListComponent extends BaseComponent implements OnInit {
  
  pageRequest: PageRequest = { pageIndex: 0, pageSize: 10 };
  listDepartment: GetListResponse<ListDepartment>;
  items: ListDepartment[];
  pagedDepartments: ListDepartment[] = [];
  currentPageNo: number;
  totalItems: number = 0;
  pageSize: number = 10;
  count: number;
  pages: number;
  pageList: number[] = [];

  constructor(
    spinner: NgxSpinnerService,
    private departmentService: DepartmentService,
    private activatedRoute: ActivatedRoute) {
    super(spinner);
  }
  
  async ngOnInit() {
    await this.getDepartments();
  }

  async getDepartments() {
    this.showSpinner(SpinnerType.BallSpinClockwise);

    this.items = [];
    
    this.activatedRoute.params.subscribe(async (params) => {
      this.currentPageNo = parseInt(params['pageNo'] ?? 1);

      const data: GetListResponse<ListDepartment> = await this.departmentService.list(
        this.currentPageNo - 1, // Sayfa indeksi hesaplama
        this.pageSize,
        () => {},
        (errorMessage) => {}
      );
      
      this.listDepartment = data;
      this.items = data.items;

      this.count = data.count;
      this.pages = Math.ceil(this.count / this.pageSize);

      this.pageList = [];
      if (this.pages >= 7) {
        if (this.currentPageNo - 3 <= 0) {
          for (let i = 1; i <= 7; i++) {
            this.pageList.push(i);
          }
        } else if (this.currentPageNo + 3 > this.pages) {
          for (let i = this.pages - 6; i <= this.pages; i++) {
            this.pageList.push(i);
          }
        } else {
          for (let i = this.currentPageNo - 3; i <= this.currentPageNo + 3; i++) {
            this.pageList.push(i);
          }
        }
      } else {
        for (let i = 1; i <= this.pages; i++) {
          this.pageList.push(i);
        }
      }
    });
    this.hideSpinner(SpinnerType.BallSpinClockwise);

  
  }
}