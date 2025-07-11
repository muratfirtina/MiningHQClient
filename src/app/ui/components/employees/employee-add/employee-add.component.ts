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

@Component({
  selector: 'app-employee-add',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, UppercaseinputDirective, BloodTypeDisplayPipe],
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
    { key: 'APositive', display: 'A Rh+' },
    { key: 'ANegative', display: 'A Rh-' },
    { key: 'BPositive', display: 'B Rh+' },
    { key: 'BNegative', display: 'B Rh-' },
    { key: 'ABPositive', display: 'AB Rh+' },
    { key: 'ABNegative', display: 'AB Rh-' },
    { key: 'OPositive', display: 'O Rh+' },
    { key: 'ONegative', display: 'O Rh-' }
  ];

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
      licenseType: [''],
      phone: [''],
      typeOfBlood: [''],
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
      licenseType: formValue.licenseType,
      phone: formValue.phone,
      typeOfBlood: formValue.typeOfBlood,
      jobId: this.getIdFromItems(this.jobs, formValue.jobName),
      quarryId: this.getIdFromItems(this.quarries, formValue.quarryName),
    };

    this.employeeService.add(create_employee, () => {
      this.toastr.success(create_employee.firstName + ' ' + create_employee.lastName + ' Başarıyla Eklendi');
      setTimeout(() => {
        this.router.navigate(['/personeller']);
      }, 1500);
    }, (errorMessage: string) => {
      this.toastr.error("Kayıt Başarısız");
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
}