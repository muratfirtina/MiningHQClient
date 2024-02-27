import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { PageRequest } from 'src/app/contracts/pageRequest';
import { LeaveEntitledService } from 'src/app/services/common/models/leave-entitled.service';
import { EmployeeService } from 'src/app/services/common/models/employee.service';
import { Employee } from 'src/app/contracts/employee/employee';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LeaveType } from 'src/app/contracts/leave/leaveType';
import { listLeaveType } from 'src/app/contracts/leave/listLeaveType';
import { ToastrService } from 'ngx-toastr';
import { GetListResponse } from 'src/app/contracts/getListResponse';
import { LeaveEntitledUsage } from 'src/app/contracts/leave/leaveEntitledUsage';
import { LeaveEntitledAdd } from 'src/app/contracts/leave/leaveEntitledAdd';

@Component({
  selector: 'app-entitled-leave',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule,RouterModule],
  templateUrl: './entitled-leave.component.html',
  styleUrls: ['./entitled-leave.component.scss','../../../../../styles.scss']
})
export class EntitledLeaveComponent extends BaseComponent implements OnInit {

  
  employees: Employee[] = [];
  leaveTypes: LeaveType[] = [];
  entitledLeaveForm: FormGroup;
  items: LeaveEntitledAdd[] = [];
  pagedEntitledLeave: LeaveEntitledUsage[] = [];
  currentPageNo: number;
  totalItems: number = 0;
  pageSize: number = 10;
  count: number;
  pages: number;
  pageList: number[] = [];
  listByEmployeeIdForm: FormGroup;
  listByEmployeeId: GetListResponse<LeaveEntitledAdd>;

  constructor(spinner:NgxSpinnerService,
    private toastrService:ToastrService,
    private router: Router,
    private employeeService: EmployeeService,
    private leaveEntitledService: LeaveEntitledService,
    private fB: FormBuilder,
    private activatedRoute: ActivatedRoute,
    ) {
    super(spinner);
    
    this.entitledLeaveForm = this.fB.group({
      employeeId: [''],
      leaveTypeId: [''],
      entitledDate: [''],
      entitledDays: [''],
      
    });

    this.listByEmployeeIdForm = this.fB.group({
      employeeId: [''],
      leaveTypeId: [''],
      startDate: [''],
      endDate: ['']
    });
    
  }

  async ngOnInit() {
    await this.getEmployee();
    await this.getLeaveType();

  }

  async addEntitledLeave() {
    const formValue = this.entitledLeaveForm.value;
    this.leaveEntitledService.add(formValue).then(() => {
      this.toastrService.success('İzin tanımlandı.');
    },
    (errorMessage: string) => {
      this.toastrService.error(errorMessage);
    });
    this.router.navigate(['hakedilenizinler', this.currentPageNo]);
  }

  getEmployee() {
    this.showSpinner(SpinnerType.BallSpinClockwise);
    this.employeeService.list(-1,-1, () => {}, (errorMessage: string) => {})
      .then((response) => {
    this.employees = response.items;
    
    })
    this.hideSpinner(SpinnerType.BallSpinClockwise);
  }

  getLeaveType() {
    this.showSpinner(SpinnerType.BallSpinClockwise);
    this.leaveEntitledService.listLeaveType(-1, -1, () => {}, (errorMessage: string) => {})
    .then((response:listLeaveType) => {
      this.leaveTypes = response.items;
    })
      .finally(() => {
        this.hideSpinner(SpinnerType.BallSpinClockwise);
      });
  }

  async listByEmployeeIdFunc() {
    const formValue = this.listByEmployeeIdForm.value;
    this.showSpinner(SpinnerType.BallSpinClockwise);
    this.items = [];

    
    
    this.activatedRoute.params.subscribe(async (params) => {
      this.currentPageNo = parseInt(params['pageNo'] ?? 1)

      const data: GetListResponse<LeaveEntitledAdd> = await this.leaveEntitledService.listByEmployeeId(
        formValue.employeeId,
        formValue.leaveTypeId,
        formValue.startDate,
        formValue.endDate,
        this.currentPageNo - 1, // Sayfa indeksi hesaplama
        this.pageSize,
        () => {},
        (errorMessage) => {}
      );
      
      this.listByEmployeeId = data;
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


