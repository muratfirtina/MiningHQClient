import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { Employee } from 'src/app/contracts/employee/employee';
import { ListEmployee } from 'src/app/contracts/employee/list-employee';
import { PageRequest } from 'src/app/contracts/pageRequest';
import { EmployeeService } from 'src/app/services/common/models/employee.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss'],
  standalone: true,
  imports: [RouterModule,CommonModule],
})
export class EmployeesComponent extends BaseComponent implements OnInit {
  pageRequest: PageRequest = { pageIndex: 0, pageSize: 10 };
  listEmployee: ListEmployee;
  items: Employee[];
  pagedEmployees: Employee[] = [];
  currentPageNo: number;
  totalItems: number = 0;
  pageSize: number = 10;
  count: number;
  pages: number;
  pageList: number[] = [];

  constructor(
    spinner: NgxSpinnerService,
    private employeeService: EmployeeService,
    private activatedRoute: ActivatedRoute) {
    super(spinner);
  }

  async ngOnInit() {

    this.showSpinner(SpinnerType.BallSpinClockwise);

    this.items = [];
    
    this.activatedRoute.params.subscribe(async (params) => {
      this.currentPageNo = parseInt(params['pageNo'] ?? 1);

      const data: ListEmployee = await this.employeeService.list(
        this.currentPageNo - 1, // Sayfa indeksi hesaplama
        this.pageSize,
        () => {},
        (errorMessage) => {}
      );
      
      this.listEmployee = data;
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
