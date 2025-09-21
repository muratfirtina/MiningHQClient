import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { PageRequest } from 'src/app/contracts/pageRequest';
import { LeaveEntitledService } from 'src/app/services/common/models/leave-entitled.service';
import { EmployeeService } from 'src/app/services/common/models/employee.service';
import { Employee } from 'src/app/contracts/employee/employee';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LeaveType } from 'src/app/contracts/leave/leaveType';
import { listLeaveType } from 'src/app/contracts/leave/listLeaveType';
import { ToastrService } from 'ngx-toastr';
import { GetListResponse } from 'src/app/contracts/getListResponse';
import { LeaveEntitledUsage } from 'src/app/contracts/leave/leaveEntitledUsage';
import { Filter, DynamicQuery } from 'src/app/contracts/dynamic-query';
import { EntitledLeaveListByDynamicEnum } from 'src/app/contracts/leave/entitledLeaveDynamic';
import { RemainingDays } from 'src/app/contracts/leave/remainingDays';
import { LeaveEntitleds } from 'src/app/contracts/leave/leaveEntitleds';
import { LeaveUsageService } from 'src/app/services/common/models/leave-usage.service';
import { LeaveUsage } from 'src/app/contracts/leave/leaveUsage/leaveUsage';
import { LeaveUsageListByDynamicEnum } from 'src/app/contracts/leave/leaveUsage/leaveUsageListByDynamicEnum';
import jsPDF from 'jspdf';
import { openSansBase64 } from 'src/assets/fonts/openSansFont';
import autoTable from 'jspdf-autotable';
import { style } from '@angular/animations';
import { CustomToastrService, ToastrMessageType, ToastrPosition } from 'src/app/services/common/custom-toastr.service';

declare var bootstrap: any;

@Component({
  selector: 'app-entitled-leave',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './entitled-leave.component.html',
  styleUrls: ['./entitled-leave.component.scss', '../../../../../styles.scss'],
})
export class EntitledLeaveComponent extends BaseComponent implements OnInit {
  @ViewChild('pdfContent') pdfContent: ElementRef;

  employees: Employee[] = [];
  employee: Employee;
  selectedEmployee: Employee | null = null;
  pagedEntitledLeave: LeaveEntitleds[] = [];
  currentPageNo: number = 1;
  pageSize: number = 10;
  pages: number;
  pageList: number[] = [];
  leaveTypes: LeaveType[] = [];
  listByEmployeeIdForm: FormGroup;
  listByEmployeeId: GetListResponse<LeaveEntitleds>;
  entitledLeaveAddForm: FormGroup;
  remainingDays: RemainingDays[] = [];
  remainingDaysForSelectedEmployee: number = -1;

  // New properties for enhanced leave management
  mainEmployeeSelectionForm: FormGroup;
  currentDataType: 'entitled' | 'used' = 'entitled';
  showFilters: boolean = true;
  totalEntitledDays: number = 0;
  totalUsedDays: number = 0;

  leaveUsageListByEmplooyeIdForm: FormGroup;
  pageLeaveUsage: LeaveUsage[] = [];
  leaveUsage: LeaveUsage;
  leaveUsageListByEmployeeId: GetListResponse<LeaveUsage>;
  leaveUsageAddForm: FormGroup;

  constructor(
    spinner: NgxSpinnerService,
    private toastrService: CustomToastrService,
    private router: Router,
    private employeeService: EmployeeService,
    private leaveEntitledService: LeaveEntitledService,
    private leaveUsageService: LeaveUsageService,
    private fB: FormBuilder,
    private activatedRoute: ActivatedRoute
  ) {
    super(spinner);

    // Main employee selection form
    this.mainEmployeeSelectionForm = this.fB.group({
      selectedEmployeeId: ['']
    });

    this.listByEmployeeIdForm = this.fB.group({
      employeeId: [''],
      leaveTypeId: [''],
      startDate: [''],
      endDate: [''],
      entitledDays: [''],
      sortDirection: ['desc'],
      entitledDaysCondition: [''],
      operator: ['eq'],
    });

    this.entitledLeaveAddForm = this.fB.group({
      employeeId: [''],
      leaveTypeId: [''],
      entitledDate: [''],
      entitledDays: ['', [Validators.required, Validators.min(1)]],
    });

    this.leaveUsageAddForm = this.fB.group({
      employeeId: [''],
      leaveTypeId: [''],
      usageDate: [''],
      returnDate: [''],
      usedDays: [{ value: '', disabled: true }],
    }, { validator: this.dateRangeValidator });

    this.leaveUsageListByEmplooyeIdForm = this.fB.group({
      employeeId: [''],
      leaveTypeId: [''],
      usageDate: [''],
      returnDate: [''],
      usedDays: [''],
      sortDirection: ['desc'],
      usedDaysCondition: [''],
      operator: ['eq'],
    });
  }

  async ngOnInit() {
    await this.getEmployee();
    await this.getLeaveType();

    // Set up form watchers for filter changes only (not main employee selection)
    this.listByEmployeeIdForm.valueChanges.subscribe(() => {
      if (this.selectedEmployee) {
        this.currentPageNo = 1;
        this.entitledListDynamicByEmployeeId();
      }
    });

    this.leaveUsageListByEmplooyeIdForm.valueChanges.subscribe(() => {
      if (this.selectedEmployee) {
        this.currentPageNo = 1;
        this.leaveUsageListDynamicByEmployeeId();
      }
    });
  }

  getEmployee() {
    this.showSpinner(SpinnerType.BallSpinClockwise);
    const pageRequest: PageRequest = { pageIndex: -1, pageSize: -1 };
    this.employeeService
      .shortList(
        pageRequest,
        () => {},
        (errorMessage: string) => {}
      )
      .then((response) => {
        this.employees = response.items;
      });
    this.hideSpinner(SpinnerType.BallSpinClockwise);
  }

  getLeaveType() {
    this.showSpinner(SpinnerType.BallSpinClockwise);
    this.leaveEntitledService
      .listLeaveType(
        -1,
        -1,
        () => {},
        (errorMessage: string) => {}
      )
      .then((response: listLeaveType) => {
        this.leaveTypes = response.items;
      })
      .finally(() => {
        this.hideSpinner(SpinnerType.BallSpinClockwise);
      });
  }

  onEmployeeSelection() {
    const selectedEmployeeId = this.mainEmployeeSelectionForm.get('selectedEmployeeId')?.value;
    
    if (selectedEmployeeId) {
      this.selectedEmployee = this.employees.find(emp => emp.id === selectedEmployeeId) || null;
      
      if (this.selectedEmployee) {
        // Set the selected employee ID in all forms
        this.listByEmployeeIdForm.get('employeeId')?.setValue(selectedEmployeeId);
        this.leaveUsageListByEmplooyeIdForm.get('employeeId')?.setValue(selectedEmployeeId);
        this.entitledLeaveAddForm.get('employeeId')?.setValue(selectedEmployeeId);
        this.leaveUsageAddForm.get('employeeId')?.setValue(selectedEmployeeId);
        
        // Reset filters to show all data initially
        this.clearFilters();
        
        // Load initial data and totals
        this.loadInitialData();
        this.loadLeaveTotals();
      }
    } else {
      this.selectedEmployee = null;
      this.pagedEntitledLeave = [];
      this.pageLeaveUsage = [];
      this.remainingDaysForSelectedEmployee = -1;
      this.totalEntitledDays = 0;
      this.totalUsedDays = 0;
    }
  }

  loadInitialData() {
    this.currentPageNo = 1;
    if (this.currentDataType === 'entitled') {
      this.entitledListDynamicByEmployeeId();
    } else {
      this.leaveUsageListDynamicByEmployeeId();
    }
    this.getRemainingDays();
  }

  loadLeaveTotals() {
    if (!this.selectedEmployee) return;

    // Load total entitled days
    this.loadTotalEntitledDays();
    
    // Load total used days
    this.loadTotalUsedDays();
  }

  loadTotalEntitledDays() {
    if (!this.selectedEmployee) return;

    console.log('🔍 Loading total entitled days for employee:', this.selectedEmployee.firstName, this.selectedEmployee.lastName);

    const filters: Filter[] = [{
      field: EntitledLeaveListByDynamicEnum.employeeId,
      operator: 'eq',
      value: this.selectedEmployee.id
    }];

    const dynamicQuery: DynamicQuery = {
      sort: [{ field: EntitledLeaveListByDynamicEnum.entitledDate, dir: 'desc' }],
      filter: {
        field: '',
        operator: '',
        logic: 'and',
        filters: filters
      }
    };

    // Use a large page size to get all data instead of -1 values
    const pageRequest = { pageIndex: 0, pageSize: 10000 };

    console.log('📤 Sending request for entitled days:', { dynamicQuery, pageRequest });

    this.leaveEntitledService.getEntitledLeavesByDynamicQuery(
      dynamicQuery,
      pageRequest,
      () => {},
      (errorMessage: string) => {}
    ).then((response: GetListResponse<LeaveEntitledUsage>) => {
      console.log('📥 Entitled days response:', response);
      const total = response.items.reduce((total, item) => total + item.entitledDays, 0);
      this.totalEntitledDays = total;
      console.log('✅ Total entitled days calculated:', total);
    }).catch((error) => {
      console.error('❌ Error loading total entitled days:', error);
      this.totalEntitledDays = 0;
    });
  }

  loadTotalUsedDays() {
    if (!this.selectedEmployee) return;

    console.log('🔍 Loading total used days for employee:', this.selectedEmployee.firstName, this.selectedEmployee.lastName);

    const filters: Filter[] = [{
      field: LeaveUsageListByDynamicEnum.employeeId,
      operator: 'eq',
      value: this.selectedEmployee.id
    }];

    const dynamicQuery: DynamicQuery = {
      sort: [{ field: LeaveUsageListByDynamicEnum.usageDate, dir: 'desc' }],
      filter: {
        field: '',
        operator: '',
        logic: 'and',
        filters: filters
      }
    };

    // Use a large page size to get all data instead of -1 values
    const pageRequest = { pageIndex: 0, pageSize: 10000 };

    console.log('📤 Sending request for used days:', { dynamicQuery, pageRequest });

    this.leaveUsageService.getLeaveUsagesByDynamicQuery(
      dynamicQuery,
      pageRequest,
      () => {},
      (errorMessage: string) => {}
    ).then((response: GetListResponse<LeaveUsage>) => {
      console.log('📥 Used days response:', response);
      const total = response.items.reduce((total, item) => total + item.usedDays, 0);
      this.totalUsedDays = total;
      console.log('✅ Total used days calculated:', total);
    }).catch((error) => {
      console.error('❌ Error loading total used days:', error);
      this.totalUsedDays = 0;
    });
  }

  switchDataType(dataType: 'entitled' | 'used') {
    this.currentDataType = dataType;
    this.currentPageNo = 1;
    
    if (this.selectedEmployee) {
      // Clear the other data type's array
      if (dataType === 'entitled') {
        this.pageLeaveUsage = [];
        this.entitledListDynamicByEmployeeId();
      } else {
        this.pagedEntitledLeave = [];
        this.leaveUsageListDynamicByEmployeeId();
      }
    }
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  clearFilters() {
    if (this.currentDataType === 'entitled') {
      this.listByEmployeeIdForm.patchValue({
        leaveTypeId: '',
        startDate: '',
        endDate: '',
        entitledDays: '',
        sortDirection: 'desc'
      });
    } else {
      this.leaveUsageListByEmplooyeIdForm.patchValue({
        leaveTypeId: '',
        usageDate: '',
        returnDate: '',
        usedDays: '',
        sortDirection: 'desc'
      });
    }
  }

  entitledListDynamicByEmployeeId() {
    this.showSpinner(SpinnerType.BallSpinClockwise);
    const formValue = this.listByEmployeeIdForm.value;
    if (!formValue.employeeId) {
      this.hideSpinner(SpinnerType.BallSpinClockwise);
      return;
    }
    
    let filters: Filter[] = [];
    const id = EntitledLeaveListByDynamicEnum.id;
    const employeeId = EntitledLeaveListByDynamicEnum.employeeId;
    const leaveTypeId = EntitledLeaveListByDynamicEnum.leaveTypeId;
    const leaveTypeName = EntitledLeaveListByDynamicEnum.leaveTypeName;
    const entitledDate = EntitledLeaveListByDynamicEnum.entitledDate;
    const entitledDays = EntitledLeaveListByDynamicEnum.entitledDays;

    const addFilter = (field: string, value: string, operator: string) => {
      if (value) {
        filters.push({ field: field, operator: operator, value: value });
      }
    };

    // Always filter by employee ID
    addFilter(employeeId, formValue.employeeId, 'eq');
    
    // Optional filters
    addFilter(leaveTypeId, formValue.leaveTypeId, 'eq');

    // Date range filters
    if (formValue.startDate) {
      const startDate = new Date(formValue.startDate);
      const formattedStartDate = `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getDate().toString().padStart(2, '0')}`;
      addFilter(entitledDate, formattedStartDate, 'gte');
    }

    if (formValue.endDate) {
      const endDate = new Date(formValue.endDate);
      const formattedEndDate = `${endDate.getFullYear()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}-${endDate.getDate().toString().padStart(2, '0')}`;
      addFilter(entitledDate, formattedEndDate, 'lte');
    }

    let dynamicFilter: Filter | undefined;
    if (filters.length > 0) {
      dynamicFilter =
        filters.length === 1
          ? filters[0]
          : {
              field: '',
              operator: '',
              logic: 'and',
              filters: filters,
            };
    }

    const dynamicQuery: DynamicQuery = {
      sort: [{ field: entitledDate, dir: formValue.sortDirection }],
      filter: dynamicFilter,
    };

    const pageRequest = {
      pageIndex: this.currentPageNo - 1,
      pageSize: this.pageSize,
    };

    this.activatedRoute.params.subscribe(async (params) => {
      this.leaveEntitledService
        .getEntitledLeavesByDynamicQuery(
          dynamicQuery,
          pageRequest,
          () => {},
          (errorMessage: string) => {}
        )
        .then((response: GetListResponse<LeaveEntitledUsage>) => {
          this.listByEmployeeId = response;
          this.pagedEntitledLeave = response.items;
          this.pages = response.pages;
          this.updatePagination();
        });
    });
    this.hideSpinner(SpinnerType.BallSpinClockwise);
  }

  leaveUsageListDynamicByEmployeeId() {
    this.showSpinner(SpinnerType.BallSpinClockwise);
    const formValue = this.leaveUsageListByEmplooyeIdForm.value;
    if (!formValue.employeeId) {
      this.hideSpinner(SpinnerType.BallSpinClockwise);
      return;
    }
    
    let filters: Filter[] = [];
    const id = LeaveUsageListByDynamicEnum.id;
    const employeeId = LeaveUsageListByDynamicEnum.employeeId;
    const leaveTypeId = LeaveUsageListByDynamicEnum.leaveTypeId;
    const leaveTypeName = LeaveUsageListByDynamicEnum.leaveTypeName;
    const usageDate = LeaveUsageListByDynamicEnum.usageDate;
    const returnDate = LeaveUsageListByDynamicEnum.returnDate;
    const usedDays = LeaveUsageListByDynamicEnum.usedDays;

    const addFilter = (field: string, value: string, operator: string) => {
      if (value) {
        filters.push({ field: field, operator: operator, value: value });
      }
    };

    // Always filter by employee ID
    addFilter(employeeId, formValue.employeeId, 'eq');
    
    // Optional filters
    addFilter(leaveTypeId, formValue.leaveTypeId, 'eq');

    // Date range filters for usage dates
    if (formValue.usageDate) {
      const date = new Date(formValue.usageDate);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      addFilter(usageDate, formattedDate, 'gte');
    }

    if (formValue.returnDate) {
      const date = new Date(formValue.returnDate);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      addFilter(returnDate, formattedDate, 'lte');
    }

    let dynamicFilter: Filter | undefined;
    if (filters.length > 0) {
      dynamicFilter =
        filters.length === 1
          ? filters[0]
          : {
              field: '',
              operator: '',
              logic: 'and',
              filters: filters,
            };
    }

    const dynamicQuery: DynamicQuery = {
      sort: [{ field: usageDate, dir: formValue.sortDirection }],
      filter: dynamicFilter,
    };

    const pageRequest = {
      pageIndex: this.currentPageNo - 1,
      pageSize: this.pageSize,
    };

    this.activatedRoute.params.subscribe(async (params) => {
      this.leaveUsageService
        .getLeaveUsagesByDynamicQuery(
          dynamicQuery,
          pageRequest,
          () => {},
          (errorMessage: string) => {}
        )
        .then((response: GetListResponse<LeaveUsage>) => {
          this.leaveUsageListByEmployeeId = response;
          this.pageLeaveUsage = response.items;
          this.pages = response.pages;
          this.updatePagination();
        });
    });
    this.hideSpinner(SpinnerType.BallSpinClockwise);
  }

  updatePagination() {
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
        for (
          let i = this.currentPageNo - 3;
          i <= this.currentPageNo + 3;
          i++
        ) {
          this.pageList.push(i);
        }
      }
    } else {
      for (let i = 1; i <= this.pages; i++) {
        this.pageList.push(i);
      }
    }
  }

  changePage(pageNo: number) {
    this.currentPageNo = pageNo;
    if (this.currentDataType === 'entitled') {
      this.entitledListDynamicByEmployeeId();
    } else {
      this.leaveUsageListDynamicByEmployeeId();
    }
  }

  deleteEntitledLeave(id: string) {
    this.showSpinner(SpinnerType.BallSpinClockwise);
    this.openConfirmModal();
    document.getElementById('confirmYes')?.addEventListener('click', () => {
      this.leaveEntitledService
        .deleteEntidledLeave(
          id,
          () => {},
          (errorMessage: string) => {}
        )
        .then(() => {
          this.toastrService.message('İzin tanımı silindi.', 'Başarılı', {
            messageType: ToastrMessageType.Success,
            position: ToastrPosition.TopRight
            });
          this.entitledListDynamicByEmployeeId();
          this.getRemainingDays(); // Update remaining days after deletion
          this.loadLeaveTotals(); // Update totals
        });
    });
    this.hideSpinner(SpinnerType.BallSpinClockwise);
  }

  deleteLeaveUsage(id: string) {
    this.showSpinner(SpinnerType.BallSpinClockwise);
    this.openConfirmModal();
    document.getElementById('confirmYes')?.addEventListener('click', () => {
      this.leaveUsageService.deleteLeaveUsage(
          id,
          () => {},
          (errorMessage: string) => {}
        )
        .then(() => {
          this.toastrService.message('İzin kullanımı silindi.', 'Başarılı', {
            messageType: ToastrMessageType.Success,
            position: ToastrPosition.TopRight
            });
          this.leaveUsageListDynamicByEmployeeId();
          this.getRemainingDays(); // Update remaining days after deletion
          this.loadLeaveTotals(); // Update totals
        });
    });
    this.hideSpinner(SpinnerType.BallSpinClockwise);
  }

  openConfirmModal() {
    const confirmModal = new bootstrap.Modal(
      document.getElementById('confirmModal')
    );
    confirmModal.show();
  }

  openEntitledLeaveAddModal() {
    const modal = new bootstrap.Modal(
      document.getElementById('entitledLeaveAddModal')
    );
    modal.show();
  }

  onEntitledLeaveAddConfirm() {
    this.entitledLeaveAdd();
  }

  openLeaveUsageAddModal() {
    const modal = new bootstrap.Modal(
      document.getElementById('leaveUsageAddModal')
    );
    modal.show();
  }

  onLeaveUsageAddConfirm() {
    this.leaveUsageAdd();
  }

  entitledLeaveAdd() {
    if(this.entitledLeaveAddForm.valid) {
      const formValue = this.entitledLeaveAddForm.value;
      const selectedLeaveType = this.leaveTypes.find(
        (lt) => lt.id === formValue.leaveTypeId
      );

      this.leaveEntitledService
        .add(
          formValue,
          () => {},
          (errorMessage: string) => {}
        )
        .then(() => {
          const message = `${this.selectedEmployee?.firstName} ${this.selectedEmployee?.lastName}, ${selectedLeaveType?.name} izni tanımlandı.`;
          this.toastrService.message(message, 'Başarılı', {
            messageType: ToastrMessageType.Success,
            position: ToastrPosition.TopRight
            });
          // Refresh data if currently showing entitled leaves
          if (this.currentDataType === 'entitled') {
            this.entitledListDynamicByEmployeeId();
          }
          this.getRemainingDays(); // Update remaining days
          this.loadLeaveTotals(); // Update totals
          // Reset form
          this.entitledLeaveAddForm.patchValue({
            leaveTypeId: '',
            entitledDate: '',
            entitledDays: ''
          });
        })
        .finally(() => {});
    }
    else {
      this.toastrService.message('Form geçersiz.', 'Hata', {
        messageType: ToastrMessageType.Error,
        position: ToastrPosition.TopRight
      });
      this.hideSpinner(SpinnerType.BallSpinClockwise);
    }
  }

  leaveUsageAdd() {
    if(this.leaveUsageAddForm.valid) {
      const formValue = this.leaveUsageAddForm.getRawValue();
      const selectedLeaveType = this.leaveTypes.find(
        (lt) => lt.id === formValue.leaveTypeId
      );

      this.leaveUsageService
        .addLeaveUsage(
          formValue,
          () => {},
          (errorMessage: string) => {}
        )
        .then(() => {
          const message = `${this.selectedEmployee?.firstName} ${this.selectedEmployee?.lastName}, ${selectedLeaveType?.name} izni kullandı.`;
          this.toastrService.message(message, 'Başarılı', {
            messageType: ToastrMessageType.Success,
            position: ToastrPosition.TopRight
            });
          // Refresh data if currently showing used leaves
          if (this.currentDataType === 'used') {
            this.leaveUsageListDynamicByEmployeeId();
          }
          this.getRemainingDays(); // Update remaining days
          this.loadLeaveTotals(); // Update totals
          // Reset form
          this.leaveUsageAddForm.patchValue({
            leaveTypeId: '',
            usageDate: '',
            returnDate: '',
            usedDays: ''
          });
        })
        .finally(() => {});
    }
    else {
      this.toastrService.message('Form geçersiz.', 'Hata', {
        messageType: ToastrMessageType.Error,
        position: ToastrPosition.TopRight
      });
      this.hideSpinner(SpinnerType.BallSpinClockwise);
    }
  }

  calculateUsedDays() {
    const usageDate = this.leaveUsageAddForm.get('usageDate')?.value;
    const returnDate = this.leaveUsageAddForm.get('returnDate')?.value;

    if (usageDate && returnDate) {
      const startDate = new Date(usageDate);
      const endDate = new Date(returnDate);

      if (endDate < startDate) {
        this.leaveUsageAddForm
          .get('returnDate')?.setErrors({ invalidDate: true });
        return;
      }

      const timeDifference = endDate.getTime() - startDate.getTime();
      const daysDifference = timeDifference / (1000 * 3600 * 24);

      this.leaveUsageAddForm.get('usedDays')?.setValue(daysDifference);
    } else {
      this.leaveUsageAddForm.get('usedDays')?.setValue('');
    }
  }

  getRemainingDays() {
    if (!this.selectedEmployee) return;
    
    this.leaveEntitledService
      .getRemainingDays(this.selectedEmployee.id)
      .then((response) => {
        this.remainingDaysForSelectedEmployee = response.totalRemainingDays;
      });
  }

  generateApprovalPDF(leaveUsage: LeaveUsage) {
    const isConfirmed = window.confirm(
      `${this.selectedEmployee?.firstName} ${this.selectedEmployee?.lastName}'in izin onayını PDF olarak indirmek istediğinize emin misiniz?`
    );
    if (isConfirmed) {
      let doc = new jsPDF();

      const fontBase64 = openSansBase64;

      doc.addFileToVFS('CustomFont.ttf', fontBase64);
      doc.addFont('CustomFont.ttf', 'CustomFont', 'normal');
      doc.setFont('CustomFont');

      const title = 'Koç Hafriyat ve Madencilik Ltd. Şti Müdürlüğü';
      const employeeName = `${this.selectedEmployee?.firstName} ${this.selectedEmployee?.lastName}`;
      const usageDate = new Date(leaveUsage.usageDate).toLocaleDateString('tr-TR');
      const returnDate = new Date(leaveUsage.returnDate).toLocaleDateString('tr-TR');
      const usedDays = leaveUsage.usedDays;
      const content = `Şirket personellerimizden ${employeeName}, ${usageDate} izine çıkış, ${returnDate} işbaşı tarihi olmak üzere ${usedDays} gün yıllık izin kullanmıştır.`;

      doc.setFontSize(16);
      const splitTitle = doc.splitTextToSize(title, 170);
      doc.text(splitTitle, 45, 40);
      doc.setFontSize(12);
      const splitContent = doc.splitTextToSize(content, 170);
      doc.text(splitContent, 20, 60);

      const pdfBlob = doc.output('blob');
      doc.save(`${employeeName}-${usageDate} izin.pdf`);

      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
    }
  }

  generateRequestPDF(leaveUsage: LeaveUsage) {
    const isConfirmed = window.confirm(
      `${this.selectedEmployee?.firstName} ${this.selectedEmployee?.lastName}'in izin talebini PDF olarak indirmek istediğinize emin misiniz?`
    );
    if (isConfirmed) {
      let doc = new jsPDF();

      const fontBase64 = openSansBase64;

      doc.addFileToVFS('CustomFont.ttf', fontBase64);
      doc.addFont('CustomFont.ttf', 'CustomFont', 'normal');
      doc.setFont('CustomFont');

      const employeeName = `${this.selectedEmployee?.firstName} ${this.selectedEmployee?.lastName}`;
      const usageDate = new Date(leaveUsage.usageDate).toLocaleDateString('tr-TR');
      const returnDate = new Date(leaveUsage.returnDate).toLocaleDateString('tr-TR');
      const usedDays = leaveUsage.usedDays;

      const title = `Koç Hafriyat ve Madencilik Ltd. Şti Müdürlüğü'ne`;
      const content = `......................................... sebebiyle, ${usageDate} izine çıkış, ${returnDate} işbaşı tarihi olmak üzere tarafıma ${usedDays} gün yıllık izin verilmesini rica ederim.`;

      doc.setFontSize(16);
      const splitTitle = doc.splitTextToSize(title, 170);
      doc.text(splitTitle, 45, 40);
      doc.setFontSize(12);
      const splitContent = doc.splitTextToSize(content, 170);
      doc.text(splitContent, 20, 60);
      doc.text('Tarih:', 150, 20);
      doc.text(`Adı Soyadı: ${employeeName}`, 20, 100);
      doc.text('İmza:', 20, 110);
      doc.text('Onay', 140, 140);

      const pdfBlob = doc.output('blob');
      doc.save(`${employeeName}-${usageDate} izin.pdf`);

      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
    }
  }

  dateRangeValidator(group: FormGroup): { [key: string]: any } | null {
    const usageDate = group.get('usageDate')?.value;
    const returnDate = group.get('returnDate')?.value;
    if (usageDate && returnDate && usageDate > returnDate) {
      return { 'dateRangeError': true };
    }
    return null;
  }
}
