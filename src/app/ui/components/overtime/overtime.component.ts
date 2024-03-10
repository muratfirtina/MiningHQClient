import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { Form, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { CustomToastrService, ToastrMessageType, ToastrOptions, ToastrPosition } from 'src/app/services/common/custom-toastr.service';
import { OvertimeAdd } from 'src/app/contracts/overtime/overtimeAdd';

declare var bootstrap: any;

@Component({
  selector: 'app-overtime',
  standalone: true,
  imports: [CommonModule,FormsModule, ReactiveFormsModule,RouterModule],
  templateUrl: './overtime.component.html',
  styleUrls: ['./overtime.component.scss','../../../../styles.scss']
})
export class OvertimeComponent extends BaseComponent implements OnInit {

  employees: Employee[] = [];
  overtimeAdd: OvertimeAdd[] = [];
  currentPageNo: number = 1;
  pageSize: number = 10;
  pages: number;
  pageList: number[] = [];
  pageOvertime: OvertimeList[] = [];
  listOvertimeResponse: GetListResponse<OvertimeList>;
  totalOvertimeHours: number =0;

  addOvertimeForm: FormGroup;
  listOvertimeForm: FormGroup;

  constructor(spinner: NgxSpinnerService, private overtimeservice:OvertimeService, private employeeService: EmployeeService,
     private fB:FormBuilder,private activatedRoute: ActivatedRoute,
     private toastr:CustomToastrService) {
    super(spinner);

    this.listOvertimeForm = this.fB.group({
      employeeId: [''],
      startDate: [''],
      endDate: [''],
    })
    this.addOvertimeForm = this.fB.group({
      employeeId: [''],
      overtimeDate: [''],
      overtimeHours: ['', [Validators.required, Validators.min(1)]],
    })
    
  }

  ngOnInit(): void {
    this.getEmployeeList();

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
    ).then((response: GetListResponse<OvertimeList>) => {
      this.listOvertimeResponse = response;
      this.pageOvertime = response.items;
      this.pages = response.pages;
      this.totalOvertimeHours = response.items.reduce((sum, item) => sum + item.overtimeHours, 0);
      this.initializePagination();
      this.hideSpinner(SpinnerType.BallSpinClockwise);
    });
  }
  
  changePage(pageNo: number) {
    this.currentPageNo = pageNo;
    this.getOvertimeListByEmployeeId(); // Her sayfa değişikliğinde listeyi güncelle
  }

  deleteOvertime(id: string) {
    this.showSpinner(SpinnerType.BallSpinClockwise);
    this.openConfirmModal();
    document.getElementById('confirmYes')?.addEventListener('click', () => {
      this.overtimeservice.overTimeDelete(id, () => {
        this.toastr.message('Mesai Başarıyla silindi.', 'Başarılı', {
          messageType: ToastrMessageType.Success,
          position: ToastrPosition.TopRight
        
        });
        this.getOvertimeListByEmployeeId();
        this.hideSpinner(SpinnerType.BallSpinClockwise);
      }, (errorMessage: string) => {
        console.error(errorMessage);
        this.hideSpinner(SpinnerType.BallSpinClockwise);
      });
    });
  }

  openConfirmModal() {
    const confirmModal = new bootstrap.Modal(document.getElementById('deleteOvertimeModal'));
    confirmModal.show();
  }

  addOvertime() {
    this.showSpinner(SpinnerType.BallSpinClockwise);
    if (this.addOvertimeForm.valid) {
    const formValues = this.addOvertimeForm.value;
    const overtimeAdd: OvertimeAdd = {
      employeeId: formValues.employeeId,
      overtimeDate: formValues.overtimeDate,
      overtimeHours: formValues.overtimeHours
    };
    this.overtimeservice.overTimeAdd(overtimeAdd, () => {
      this.toastr.message('Mesai Başarıyla eklendi.', 'Başarılı', {
        messageType: ToastrMessageType.Success,
        position: ToastrPosition.TopRight
      });
      this.hideSpinner(SpinnerType.BallSpinClockwise);
    }, (errorMessage: string) => {
      console.error(errorMessage);
      this.hideSpinner(SpinnerType.BallSpinClockwise);
    });
  }
  else {
    this.toastr.message('Form geçersiz.', 'Hata', {
      messageType: ToastrMessageType.Error,
      position: ToastrPosition.TopRight
    });
    this.hideSpinner(SpinnerType.BallSpinClockwise);
  }
  }

  openOvertimeAddModal() {
    const modal = new bootstrap.Modal(document.getElementById('overtimeAddModal'));
    modal.show();
  }
  
  onOvertimeAddModalConfirm() {
    this.addOvertime();
  }
}
