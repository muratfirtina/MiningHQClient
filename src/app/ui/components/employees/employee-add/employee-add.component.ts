import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { EmployeeService } from 'src/app/services/common/models/employee.service';
import { CreateEmployee } from 'src/app/contracts/employee/create-employee';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { JobService } from 'src/app/services/common/models/job.service';
import { PageRequest } from 'src/app/contracts/pageRequest';
import { Job } from 'src/app/contracts/job/job';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Quarry } from 'src/app/contracts/quarry/quarry';
import { QuarryService } from 'src/app/services/common/models/quarry.service';
import { UppercaseinputDirective } from 'src/app/directives/common/uppercaseinput.directive';
import { BloodTypeDisplayPipe } from 'src/app/pipes/bloodTypeDisplay.pipe';
import { LicenseTypes } from 'src/app/contracts/licenseTypes';
import { OperatorLicense } from 'src/app/contracts/operatorLicense';
import { TypeOfBlood } from 'src/app/contracts/typeOfBlood';

@Component({
  selector: 'app-employee-add',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, UppercaseinputDirective],
  templateUrl: './employee-add.component.html',
  styleUrls: ['./employee-add.component.scss','../../../../../styles.scss']
})
export class EmployeeAddComponent extends BaseComponent implements OnInit {

  @Output() createdProduct: EventEmitter<CreateEmployee> = new EventEmitter();

  pageRequest: PageRequest = { pageIndex: -1, pageSize: -1 };

  jobs: Job[] = [];
  quarries: Quarry[] = [];
  employeeForm: FormGroup;

  // Kan grubu seçenekleri
  bloodTypeOptions = [
    { key: TypeOfBlood.None, display: 'Seçiniz' },
    { key: TypeOfBlood.APositive, display: 'A Rh+' },
    { key: TypeOfBlood.ANegative, display: 'A Rh-' },
    { key: TypeOfBlood.BPositive, display: 'B Rh+' },
    { key: TypeOfBlood.BNegative, display: 'B Rh-' },
    { key: TypeOfBlood.ABPositive, display: 'AB Rh+' },
    { key: TypeOfBlood.ABNegative, display: 'AB Rh-' },
    { key: TypeOfBlood.OPositive, display: 'O Rh+' },
    { key: TypeOfBlood.ONegative, display: 'O Rh-' }
  ];

  // Ehliyet tipi seçenekleri
  licenseTypeOptions = [
    { key: LicenseTypes.None, display: 'Seçiniz' },
    { key: LicenseTypes.A1, display: 'A1 - Motosiklet (125cc\'ye kadar)' },
    { key: LicenseTypes.A2, display: 'A2 - Motosiklet (35kW\'a kadar)' },
    { key: LicenseTypes.A, display: 'A - Motosiklet (sınırsız)' },
    { key: LicenseTypes.B1, display: 'B1 - Hafif araç' },
    { key: LicenseTypes.B, display: 'B - Otomobil' },
    { key: LicenseTypes.BE, display: 'BE - Otomobil + römorkluk' },
    { key: LicenseTypes.C1, display: 'C1 - Orta kamyon (3.5-7.5 ton)' },
    { key: LicenseTypes.C1E, display: 'C1E - Orta kamyon + römorkluk' },
    { key: LicenseTypes.C, display: 'C - Kamyon (7.5 ton üzeri)' },
    { key: LicenseTypes.CE, display: 'CE - Kamyon + römorkluk' },
    { key: LicenseTypes.D1, display: 'D1 - Küçük otobüs (16 kişiye kadar)' },
    { key: LicenseTypes.D1E, display: 'D1E - Küçük otobüs + römorkluk' },
    { key: LicenseTypes.D, display: 'D - Otobüs (16 kişi üzeri)' },
    { key: LicenseTypes.DE, display: 'DE - Otobüs + römorkluk' },
    { key: LicenseTypes.F, display: 'F - Traktör' },
    { key: LicenseTypes.G, display: 'G - İş makinesi' },
    { key: LicenseTypes.M, display: 'M - Moped' }
  ];

  // Operatör lisans seçenekleri
  operatorLicenseOptions = [
    { key: OperatorLicense.None, display: 'Seçiniz' },
    { key: OperatorLicense.Loader, display: 'Yükleyici' },
    { key: OperatorLicense.Excavator, display: 'Ekskavatör' },
    { key: OperatorLicense.LoaderAndExcavator, display: 'Yükleyici + Ekskavatör' },
    { key: OperatorLicense.Drill, display: 'Delici' }
  ];

  // Seçilen job'ın operatör olup olmadığını kontrol et
  isOperatorJob = false;

  constructor(
    spinner: NgxSpinnerService,
    private employeeService: EmployeeService,
    private toastr: ToastrService,
    public router: Router,
    private jobService: JobService,
    private quarryService: QuarryService,
    private fB: FormBuilder
  ) {
    super(spinner);

    this.employeeForm = this.fB.group({
      firstName: [''],
      lastName: [''],
      jobName: [''],
      quarryName: [''],
      birthDate: [''],
      emergencyContact: [''],
      hireDate: [''],
      licenseType: [null],
      operatorLicense: [null],
      phone: [''],
      typeOfBlood: [null],
      address: ['']
    });
  }

  async ngOnInit() {
    await this.getJobs();
    await this.getQuarries();
  }

  addEmployee(formValue: any) {
    const create_employee: CreateEmployee = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      jobName: formValue.jobName,
      quarryName: formValue.quarryName,
      birthDate: new Date(formValue.birthDate),
      emergencyContact: formValue.emergencyContact,
      address: formValue.address,
      hireDate: new Date(formValue.hireDate),
      licenseType: formValue.licenseType && Number(formValue.licenseType) !== 0 ? Number(formValue.licenseType) : null,
      operatorLicense: this.isOperatorJob && formValue.operatorLicense && Number(formValue.operatorLicense) !== 0 ? Number(formValue.operatorLicense) : null,
      phone: formValue.phone,
      typeOfBlood: formValue.typeOfBlood && Number(formValue.typeOfBlood) !== 0 ? Number(formValue.typeOfBlood) : null,
      jobId: this.getIdFromItems(this.jobs, formValue.jobName),
      quarryId: this.getIdFromItems(this.quarries, formValue.quarryName),
    };

    console.log('Gönderilen veri:', create_employee);
    console.log('LicenseType:', typeof create_employee.licenseType, create_employee.licenseType);
    console.log('TypeOfBlood:', typeof create_employee.typeOfBlood, create_employee.typeOfBlood);
    console.log('OperatorLicense:', typeof create_employee.operatorLicense, create_employee.operatorLicense);

    this.employeeService.add(create_employee, () => {
      this.toastr.success(create_employee.firstName + ' ' + create_employee.lastName + ' Başarıyla Eklendi');
      setTimeout(() => {
        this.router.navigate(['/personeller']);
      }, 1500);
    }, (errorMessage: string) => {
      this.toastr.error("Kayıt Başarısız");
      console.error('Hata detayı:', errorMessage);
    });
  }

  private getIdFromItems(items: any[], value: string): string | null {
    const item = items.find(item => item.name === value);
    return item ? item.id : null;
  }

  getJobs() {
    this.showSpinner(SpinnerType.BallSpinClockwise);
    this.jobService.list(this.pageRequest.pageIndex, this.pageRequest.pageSize, () => {}, (errorMessage: string) => {})
      .then((response) => {
        this.jobs = response.items;
      });
    this.hideSpinner(SpinnerType.BallSpinClockwise);
  }

  getQuarries() {
    this.quarryService.list(this.pageRequest.pageIndex, this.pageRequest.pageSize, () => {}, (errorMessage: string) => {})
      .then((response) => {
        this.quarries = response.items;
      });
  }

  toUpperCase(fieldName: string): void {
    const value = this.employeeForm.get(fieldName)?.value;
    if (value) {
      this.employeeForm.get(fieldName)?.setValue(value.toLocaleUpperCase('tr-TR'), { emitEvent: false });
    }
  }

  // Meslek değiştiğinde operatör kontrolü yap
  onJobChange(jobName: string): void {
    this.isOperatorJob = jobName.toLowerCase().includes('operatör') || 
                        jobName.toLowerCase().includes('operator') ||
                        jobName.toLowerCase().includes('makinist');
    
    // Eğer operatör değilse operatör lisansını sıfırla
    if (!this.isOperatorJob) {
      this.employeeForm.get('operatorLicense')?.setValue(null);
    }
  }
}