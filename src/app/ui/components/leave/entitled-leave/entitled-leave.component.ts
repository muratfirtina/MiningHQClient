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
  remainingDays: RemainingDays[] = [];
  remainingDaysForSelectedEmployee: number = 0;

  selectionForm: FormGroup;

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
    },{ validator: this.dateRangeValidator });

    this.selectionForm = this.fB.group({
      selection: [''], // Default selection
    });

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

    this.listByEmployeeIdForm.valueChanges.subscribe(() => {
      this.currentPageNo = 1; // Form değiştiğinde sayfayı sıfırla
      this.entitledListDynamicByEmployeeId();
    });

    this.leaveUsageListByEmplooyeIdForm.valueChanges.subscribe(() => {
      this.currentPageNo = 1; // Form değiştiğinde sayfayı sıfırla
      this.leaveUsageListDynamicByEmployeeId();
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

  entitledListDynamicByEmployeeId() {
    this.showSpinner(SpinnerType.BallSpinClockwise);
    const formValue = this.listByEmployeeIdForm.value;
    if (!formValue.employeeId) {
      this.hideSpinner(SpinnerType.BallSpinClockwise);
      return; // Don't fetch data if no employee is selected
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
        // Eğer değer boş değilse filtreye ekle
        filters.push({ field: field, operator: operator, value: value });
      }
    };

    addFilter(employeeId, formValue.employeeId, formValue.operator);
    addFilter(leaveTypeId, formValue.leaveTypeId, formValue.operator);
    addFilter(entitledDate, formValue.entitledDate, formValue.operator);

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
      pageIndex: this.currentPageNo - 1, // Angular front-end'de sayfa 1'den başlar, ancak API'de 0'dan başlar
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
        });
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
    const selectedEmployee = this.employees.find(
      (e) => e.id === formValue.employeeId
    );
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
        const message = `${selectedEmployee?.firstName} ${selectedEmployee?.lastName}, ${selectedLeaveType?.name} izni tanımlandı.`;
        this.toastrService.message(message, 'Başarılı', {
          messageType: ToastrMessageType.Success,
          position: ToastrPosition.TopRight
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
    const formValue = this.leaveUsageAddForm.getRawValue(); // formValue'de disabled alanları da dahil etmek için getRawValue kullanılır.

    const selectedEmployee = this.employees.find(
      (e) => e.id === formValue.employeeId
    );
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
        const message = `${selectedEmployee?.firstName} ${selectedEmployee?.lastName}, ${selectedLeaveType?.name} izni kullandı.`;
        this.toastrService.message(message, 'Başarılı', {
          messageType: ToastrMessageType.Success,
          position: ToastrPosition.TopRight
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
    const usageDate = this.leaveUsageAddForm.get('usageDate').value;
    const returnDate = this.leaveUsageAddForm.get('returnDate').value;

    if (usageDate && returnDate) {
      const startDate = new Date(usageDate);
      const endDate = new Date(returnDate);

      // Ensure the return date is after the start date
      if (endDate < startDate) {
        this.leaveUsageAddForm
          .get('returnDate')
          .setErrors({ invalidDate: true });
        return;
      }

      const timeDifference = endDate.getTime() - startDate.getTime();
      const daysDifference = timeDifference / (1000 * 3600 * 24); // +1 to include both start and end days

      this.leaveUsageAddForm.get('usedDays').setValue(daysDifference);
    } else {
      this.leaveUsageAddForm.get('usedDays').setValue('');
    }
  }

  getRemainingDays() {
    let formValue = this.listByEmployeeIdForm.value;
    this.leaveEntitledService
      .getRemainingDays(formValue.employeeId)
      .then((response) => {
        this.remainingDaysForSelectedEmployee = response.totalRemainingDays; // Servisten dönen değeri saklayın
      });
  }

  leaveUsageListDynamicByEmployeeId() {
    this.showSpinner(SpinnerType.BallSpinClockwise);
    const formValue = this.leaveUsageListByEmplooyeIdForm.value;
    if (!formValue.employeeId) {
      this.hideSpinner(SpinnerType.BallSpinClockwise);
      return; // Don't fetch data if no employee is selected
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
        // Eğer değer boş değilse filtreye ekle
        filters.push({ field: field, operator: operator, value: value });
      }
    };

    addFilter(employeeId, formValue.employeeId, formValue.operator);
    addFilter(leaveTypeId, formValue.leaveTypeId, formValue.operator);
    addFilter(returnDate, formValue.returnDate, formValue.operator);

    if (formValue.usageDate) {
      // Tarihi "YYYY-MM-DD" formatına dönüştür
      const date = new Date(formValue.usageDate);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Ay 0'dan başladığı için 1 ekliyoruz ve iki basamaklı yapmak için padStart kullanıyoruz
      const day = date.getDate().toString().padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`; // "2024-02-15" formatında bir string oluşturur

      addFilter(usageDate, formattedDate, 'gte');
      console.log(formattedDate);
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
      pageIndex: this.currentPageNo - 1, // Angular front-end'de sayfa 1'den başlar, ancak API'de 0'dan başlar
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
        });
    });
    this.hideSpinner(SpinnerType.BallSpinClockwise);
  }

  onSelectionChange() {
    const selection = this.selectionForm.get('selection').value;
    if (selection === 'entitledLeaves') {
      this.entitledListDynamicByEmployeeId();
    } else if (selection === 'usedLeaves') {
      this.leaveUsageListDynamicByEmployeeId();
    }
  }

  generateApprovalPDF(leaveUsage: LeaveUsage) {
    const isConfirmed = window.confirm(
      ` ${this.employees.find((e) => e.id === leaveUsage.employeeId)?.firstName} ${
        this.employees.find((e) => e.id === leaveUsage.employeeId)?.lastName
      }'in izin onayını PDF olarak indirmek istediğinize emin misiniz?`
    );
    if (isConfirmed) {
      let doc = new jsPDF();

      const fontBase64 = openSansBase64;

      doc.addFileToVFS('CustomFont.ttf', fontBase64);
      doc.addFont('CustomFont.ttf', 'CustomFont', 'normal');
      doc.setFont('CustomFont');

      const title = 'Koç Hafriyat ve Madencilik Ltd. Şti Müdürlüğü';
      const employeeName =
        this.employees.find((e) => e.id === leaveUsage.employeeId)?.firstName +
        ' ' +
        this.employees.find((e) => e.id === leaveUsage.employeeId)?.lastName;
      const usageDate = new Date(leaveUsage.usageDate).toLocaleDateString(
        'tr-TR'
      );
      const returnDate = new Date(leaveUsage.returnDate).toLocaleDateString(
        'tr-TR'
      );
      const usedDays = leaveUsage.usedDays;
      const content = `Şirket personellerimizden ${employeeName}, ${usageDate} izine çıkış, ${returnDate} işbaşı tarihi olmak üzere ${usedDays} gün yıllık izin kullanmıştır.`;

      doc.setFontSize(16);
      const splitTitle = doc.splitTextToSize(title, 170); // Sayfanın genişliği genellikle 190-200 mm arasındadır
      doc.text(splitTitle, 45, 40); // Başlığı sayfaya ekleyin
      doc.setFontSize(12);
      const splitContent = doc.splitTextToSize(content, 170);
      doc.text(splitContent, 20, 60); // İçeriği sayfaya ekleyin

      const pdfBlob = doc.output('blob');
      doc.save(`${employeeName}-${usageDate} izin.pdf`);

      // Blob için bir URL oluştur
      const pdfUrl = URL.createObjectURL(pdfBlob);

      // Yeni sekmede PDF'i aç
      window.open(pdfUrl, '_blank');
    } else {
      return;
    }
  }

  generateRequestPDF(leaveUsage: LeaveUsage) {
    const isConfirmed = window.confirm(
      ` ${this.employees.find((e) => e.id === leaveUsage.employeeId)?.firstName} ${
        this.employees.find((e) => e.id === leaveUsage.employeeId)?.lastName
      }'in izin talebini PDF olarak indirmek istediğinize emin misiniz?`
    );
    if (isConfirmed) {
      let doc = new jsPDF();

      const fontBase64 = openSansBase64;

      doc.addFileToVFS('CustomFont.ttf', fontBase64);
      doc.addFont('CustomFont.ttf', 'CustomFont', 'normal');
      doc.setFont('CustomFont');

      

      const employeeName =
        this.employees.find((e) => e.id === leaveUsage.employeeId)?.firstName +
        ' ' +
        this.employees.find((e) => e.id === leaveUsage.employeeId)?.lastName;
      const usageDate = new Date(leaveUsage.usageDate).toLocaleDateString(
        'tr-TR'
      );
      const returnDate = new Date(leaveUsage.returnDate).toLocaleDateString(
        'tr-TR'
      );
      const usedDays = leaveUsage.usedDays;

      const title = `Koç Hafriyat ve Madencilik Ltd. Şti Müdürlüğü'ne`;
      const content = `......................................... sebebiyle, ${usageDate} izine çıkış, ${returnDate} işbaşı tarihi olmak üzere tarafıma ${usedDays} gün yıllık izin verilmesini rica ederim.`;

      doc.setFontSize(16);
      const splitTitle = doc.splitTextToSize(title, 170); // Sayfanın genişliği genellikle 190-200 mm arasındadır
      doc.text(splitTitle, 45, 40); // Başlığı sayfaya ekleyin
      doc.setFontSize(12);
      const splitContent = doc.splitTextToSize(content, 170);
      doc.text(splitContent, 20, 60);
      doc.text('Tarih:', 150, 20);
      doc.text(`Adı Soyadı: ${employeeName}`, 20, 100);
      doc.text('İmza:', 20, 110);
      doc.text('Onay', 140, 140);

      const pdfBlob = doc.output('blob');
      doc.save(`${employeeName}-${usageDate} izin.pdf`);

      // Blob için bir URL oluştur
      const pdfUrl = URL.createObjectURL(pdfBlob);

      // Yeni sekmede PDF'i aç
      window.open(pdfUrl, '_blank');
    } else {
      return;
    }
  }

  dateRangeValidator(group: FormGroup): { [key: string]: any } | null {
    const usageDate = group.get('usageDate').value;
    const returnDate = group.get('returnDate').value;
    if (usageDate && returnDate && usageDate > returnDate) {
      // `returnDate` `usageDate`'den önceyse bir hata döndür
      return { 'dateRangeError': true };
    }
    // Sorun yoksa null döndür
    return null;
  }
}
