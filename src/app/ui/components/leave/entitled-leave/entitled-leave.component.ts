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
import { Filter, DynamicQuery } from 'src/app/contracts/dynamic-query';
import { EntitledLeaveListByDynamicEnum } from 'src/app/contracts/leave/entitledLeaveDynamic';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { RemainingDays } from 'src/app/contracts/leave/remainingDays';
import { LeaveEntitleds } from 'src/app/contracts/leave/leaveEntitleds';

declare var bootstrap: any;

@Component({
  selector: 'app-entitled-leave',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule,RouterModule],
  templateUrl: './entitled-leave.component.html',
  styleUrls: ['./entitled-leave.component.scss','../../../../../styles.scss']
})
export class EntitledLeaveComponent extends BaseComponent implements OnInit {

  
    employees: Employee[] = [];
    selectedEmployeeId: string | null;
    pagedEntitledLeave: LeaveEntitleds[] = [];
    currentPageNo: number = 1;
    pageSize: number = 10;
    pages: number;
    pageList: number[] = [];
    leaveTypes: LeaveType[] = [];
    listByEmployeeIdForm: FormGroup;
    listByEmployeeId: GetListResponse<LeaveEntitleds>;
    entitledLeaveAddForm: FormGroup;
    remainingDays: RemainingDays [] = [];
    remainingDaysForSelectedEmployee: number = 0;

  constructor(spinner:NgxSpinnerService,
    private toastrService:ToastrService,
    private router: Router,
    private employeeService: EmployeeService,
    private leaveEntitledService: LeaveEntitledService,
    private fB: FormBuilder,
    private activatedRoute: ActivatedRoute,
    ) {
    super(spinner);
    this.listByEmployeeIdForm = this.fB.group({
      employeeId: [''],
      leaveTypeId: [''],
      startDate: [''],
      endDate: [''],
      entitledDays: [''],
      sortDirection: ['desc'],
      entitledDaysCondition: [''],
      operator: ['eq']
    });

    this.entitledLeaveAddForm = this.fB.group({
      employeeId: [''],
      leaveTypeId: [''],
      entitledDate: [''],
      entitledDays: ['']
    });
    
  }

  async ngOnInit() {
    await this.getEmployee();
    await this.getLeaveType();

    this.listByEmployeeIdForm.valueChanges.subscribe(() => {
      this.currentPageNo = 1; // Form değiştiğinde sayfayı sıfırla
      this.entitledListDynamicByEmployeeId();
    });

  }


  getEmployee() {
    this.showSpinner(SpinnerType.BallSpinClockwise);
    const pageRequest: PageRequest = { pageIndex: -1, pageSize: -1 };
    this.employeeService.shortList(pageRequest, () => {}, (errorMessage: string) => {})
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

  entitledListDynamicByEmployeeId() {

    this.showSpinner(SpinnerType.BallSpinClockwise);
    const formValue = this.listByEmployeeIdForm.value
    let filters : Filter []=[]
    const id = EntitledLeaveListByDynamicEnum.id
    const employeeId = EntitledLeaveListByDynamicEnum.employeeId
    const leaveTypeId = EntitledLeaveListByDynamicEnum.leaveTypeId
    const leaveTypeName = EntitledLeaveListByDynamicEnum.leaveTypeName
    const entitledDate = EntitledLeaveListByDynamicEnum.entitledDate
    const entitledDays = EntitledLeaveListByDynamicEnum.entitledDays

    const addFilter = (field: string, value: string, operator:string) => {
      if (value) { // Eğer değer boş değilse filtreye ekle
        filters.push({ field: field, operator: operator, value: value });
      }
    };

    addFilter(employeeId, formValue.employeeId, formValue.operator)
    addFilter(leaveTypeId, formValue.leaveTypeId, formValue.operator)
    addFilter(entitledDate, formValue.entitledDate, formValue.operator)

    let dynamicFilter: Filter | undefined;
    if (filters.length > 0) {
      dynamicFilter = filters.length === 1 ? filters[0] : {
        field: "",
        operator: "",
        logic: "and",
        filters: filters
      };
    }

    const dynamicQuery: DynamicQuery = {
      sort: [{ field: entitledDate, dir: formValue.sortDirection }],
      filter: dynamicFilter
    };

    const pageRequest = {
      pageIndex: this.currentPageNo - 1, // Angular front-end'de sayfa 1'den başlar, ancak API'de 0'dan başlar
      pageSize: this.pageSize
    };

   

    this.activatedRoute.params.subscribe(async (params) => {
      this.leaveEntitledService.getEntitledLeavesByDynamicQuery(dynamicQuery, pageRequest, () => {}, (errorMessage: string) => {})
      .then((response: GetListResponse<LeaveEntitledUsage>) => {
        this.getRemainingDays();
        this.listByEmployeeId = response;
        this.pagedEntitledLeave = response.items;
        this.pages = response.pages;
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

      //eğer html de entitledDaysCondition 0 dan büyük seçilmişse backend tarafında entitledDays 0 dan büyük olanlar getirilir.
      if(formValue.entitledDaysCondition == "gt")
      this.pagedEntitledLeave = this.pagedEntitledLeave.filter(x => x.entitledDays > 0);
      //eğer html de entitledDaysCondition 0 dan küçük seçilmişse backend tarafında entitledDays 0 dan küçük olanlar getirilir.
      else if(formValue.entitledDaysCondition == "lt")
      this.pagedEntitledLeave = this.pagedEntitledLeave.filter(x => x.entitledDays < 0);
      //eğer html de entitledDaysCondition seçilmemiş ise seçilmişse backend tarafında entitledDays tümünü getirilir.
      else if(formValue.entitledDaysCondition == "")
      this.pagedEntitledLeave = this.pagedEntitledLeave;
      
      })
    });
    this.hideSpinner(SpinnerType.BallSpinClockwise);
  }

  changePage(pageNo: number) {
    this.currentPageNo = pageNo;
    this.entitledListDynamicByEmployeeId(); // Yeni sayfa numarasıyla listeleme yap
  }

  deleteEntitledLeave(id: string) {
    this.showSpinner(SpinnerType.BallSpinClockwise);
    this.openConfirmModal();
    document.getElementById('confirmYes')?.addEventListener('click', () => {
      this.leaveEntitledService.deleteEntidledLeave(id, () => {}, (errorMessage: string) => {})
      .then(() => {
        this.toastrService.success('İzin tanımı silindi.');
        this.entitledListDynamicByEmployeeId();
      })
    });
    this.hideSpinner(SpinnerType.BallSpinClockwise);
    
  }

  openConfirmModal() {
    const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
    confirmModal.show();
  }

  entitledLeaveAdd() {
    const formValue = this.entitledLeaveAddForm.value;

    const selectedEmployee = this.employees.find(e => e.id === formValue.employeeId);
    const selectedLeaveType = this.leaveTypes.find(lt => lt.id === formValue.leaveTypeId);

    this.leaveEntitledService.add(formValue, () => {}, (errorMessage: string) => {})
    .then(() => {
      const message = `${selectedEmployee?.firstName} ${selectedEmployee?.lastName}, ${selectedLeaveType?.name} izni tanımlandı.`;
      this.toastrService.success(message);
      this.router.navigate(['/hakedilenizinler', this.currentPageNo]);
    })
    .finally(() => {
      
    });
  }

  getRemainingDays() {
    let formValue = this.listByEmployeeIdForm.value;
    this.leaveEntitledService.getRemainingDays(formValue.employeeId)
      .then(response => {
        this.remainingDaysForSelectedEmployee = response.totalRemainingDays; // Servisten dönen değeri saklayın
      })
  }

}
