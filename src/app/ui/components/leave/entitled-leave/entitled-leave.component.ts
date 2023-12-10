import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { PageRequest } from 'src/app/contracts/pageRequest';
import { LeaveEntitledService } from 'src/app/services/common/models/leave-entitled.service';
import { EmployeeService } from 'src/app/services/common/models/employee.service';
import { Employee } from 'src/app/contracts/employee/employee';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LeaveEntitled } from 'src/app/contracts/leave/leaveEntitled';
import { LeaveType } from 'src/app/contracts/leave/leaveType';
import { listLeaveType } from 'src/app/contracts/leave/listLeaveType';
import { EntitledLeavelistByEmployeeId } from 'src/app/contracts/leave/listByEmployeId';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-entitled-leave',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './entitled-leave.component.html',
  styleUrls: ['./entitled-leave.component.scss','../../../../../styles.scss']
})
export class EntitledLeaveComponent extends BaseComponent implements OnInit {

  pageRequest: PageRequest = { pageIndex: -1, pageSize: -1 };
  employees: Employee[] = [];
  leaveTypes: LeaveType[] = [];
  entitledLeaveForm: FormGroup;
  entitledLeaves: LeaveEntitled[] = [];
  listByEmployeeIdForm: FormGroup;
  listByEmployeeId: EntitledLeavelistByEmployeeId[] = [];

  constructor(spinner:NgxSpinnerService,
    private toastrService:ToastrService,
    private router: Router,
    private employeeService: EmployeeService,
    private leaveEntitledService: LeaveEntitledService,
    private fB: FormBuilder,private cdr: ChangeDetectorRef) {
    super(spinner);
    
    this.entitledLeaveForm = this.fB.group({
      employeeId: [''],
      leaveTypeId: [''],
      entitledDate: [''],
      entitledDays: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  async ngOnInit() {
    await this.getEmployee();
    await this.getLeaveType();

    this.entitledLeaveForm.valueChanges.subscribe(() => {
      this.listByEmployeeIdFunc();
    });
  }

  async addEntitledLeave() {
    const formValue = this.entitledLeaveForm.value;
    // Sunucuya gönderme işlemi
    this.leaveEntitledService.add(formValue).then(() => {
      this.toastrService.success('İzin tanımlandı.');
    },
    (errorMessage: string) => {
      this.toastrService.error(errorMessage);
    });
  }

  getEmployee() {
    this.showSpinner(SpinnerType.BallSpinClockwise);
    this.employeeService.list(this.pageRequest.pageIndex, this.pageRequest.pageSize, () => {}, (errorMessage: string) => {})
      .then((response) => {
    this.employees = response.items;
    
    })
    this.hideSpinner(SpinnerType.BallSpinClockwise);
  }

  getLeaveType() {
    this.showSpinner(SpinnerType.BallSpinClockwise);
    this.leaveEntitledService.listLeaveType(this.pageRequest.pageIndex, this.pageRequest.pageSize, () => {}, (errorMessage: string) => {})
    .then((response:listLeaveType) => {
      this.leaveTypes = response.items;
    })
      .finally(() => {
        this.hideSpinner(SpinnerType.BallSpinClockwise);
      });
  }

  listByEmployeeIdFunc() {
    const formValue = this.entitledLeaveForm.value;
    this.showSpinner(SpinnerType.BallSpinClockwise);
    this.leaveEntitledService.listByEmployeeId(formValue.employeeId, formValue.leaveTypeId, formValue.startDate, formValue.endDate)
      .then((response) => {
        this.entitledLeaves = response.entitledLeaves;
        this.cdr.detectChanges();
        this.hideSpinner(SpinnerType.BallSpinClockwise);
      })
      .catch((error: string) => {
        this.toastrService.error(error);
        this.hideSpinner(SpinnerType.BallSpinClockwise);
      });
  }

}


