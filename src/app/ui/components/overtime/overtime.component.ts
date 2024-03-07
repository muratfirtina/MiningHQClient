import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { Form, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OvertimeService } from 'src/app/services/common/models/overtime.service';
import { EmployeeService } from 'src/app/services/common/models/employee.service';
import { PageRequest } from 'src/app/contracts/pageRequest';
import { Employee } from 'src/app/contracts/employee/employee';
import { DynamicQuery, Filter } from 'src/app/contracts/dynamic-query';
import { OvertimeByDynamicEnum } from 'src/app/contracts/overtime/overTimeByDynamicEnum';
import { Overtime } from 'src/app/contracts/overtime/overtime';
import { GetListResponse } from 'src/app/contracts/getListResponse';
import { OvertimeList } from 'src/app/contracts/overtime/overtimeList';

@Component({
  selector: 'app-overtime',
  standalone: true,
  imports: [CommonModule,FormsModule, ReactiveFormsModule,RouterModule],
  templateUrl: './overtime.component.html',
  styleUrls: ['./overtime.component.scss','../../../../styles.scss']
})
export class OvertimeComponent extends BaseComponent implements OnInit {

  employees: Employee[] = [];
  currentPageNo: number = 1;
  pageSize: number = 10;
  pages: number;
  pageList: number[] = [];
  pageOvertime: OvertimeList[] = [];
  listOvertimeResponse: GetListResponse<OvertimeList>;


  listOvertimeForm: FormGroup;

  constructor(spinner: NgxSpinnerService, private overtimeservice:OvertimeService, private employeeService: EmployeeService, private fB:FormBuilder,private activatedRoute: ActivatedRoute) {
    super(spinner);

    this.listOvertimeForm = this.fB.group({
      employeeId: [''],
      startDate: [''],
      endDate: [''],
    })
    
  }

  ngOnInit(): void {
    this.getEmployeeList();
    this.listOvertimeForm.valueChanges.subscribe(() => {
      this.currentPageNo = 1;
      this.getOvertimeListByEmployeeId();
    }
    );

  }

  getEmployeeList(){
    this.showSpinner(SpinnerType.BallSpinClockwise);
    const pageRequest: PageRequest = { pageIndex: -1, pageSize: -1 };
    this.employeeService.shortList(pageRequest, () => {}, (errorMessage: string) => {})
      .then((response) => {
    this.employees = response.items;
    
    })
    this.hideSpinner(SpinnerType.BallSpinClockwise);
  }

  initializePagination() {
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
  }
  
  getOvertimeListByEmployeeId() {
    this.showSpinner(SpinnerType.BallSpinClockwise);
    const formValues = this.listOvertimeForm.value;
    const employeeId = formValues.employeeId;
    const startDate = formValues.startDate;
    const endDate = formValues.endDate;
    const pageRequest: PageRequest = { pageIndex: this.currentPageNo -1, pageSize: this.pageSize };
  
    this.overtimeservice.overTimeGetListByEmployeeId(employeeId, startDate, endDate, pageRequest, 
      () => {}, 
      (errorMessage: string) => { console.error(errorMessage); }
    ).then((response) => {
      this.listOvertimeResponse = response;
      this.pageOvertime = response.items;
      this.pages = response.pages;
      this.initializePagination();
      this.hideSpinner(SpinnerType.BallSpinClockwise);
    });
  }
  
  changePage(pageNo: number) {
    this.currentPageNo = pageNo;
    this.getOvertimeListByEmployeeId(); // Her sayfa değişikliğinde listeyi güncelle
  }
}
