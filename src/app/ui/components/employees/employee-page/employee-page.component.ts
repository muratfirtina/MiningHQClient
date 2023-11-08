import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from 'src/app/base/base.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { EmployeeService } from 'src/app/services/common/models/employee.service';
import { SingleEmployee } from 'src/app/contracts/employee/single-employee';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PageRequest } from 'src/app/contracts/pageRequest';
import { JobService } from 'src/app/services/common/models/job.service';
import { Job } from 'src/app/contracts/job/job';
import { Quarry } from 'src/app/contracts/quarry/quarry';
import { QuarryService } from 'src/app/services/common/models/quarry.service';
import { ToastrService } from 'ngx-toastr';

declare var $: any;



@Component({
  selector: 'app-employee-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule,ReactiveFormsModule],
  templateUrl: './employee-page.component.html',
  styleUrls: ['./employee-page.component.scss']
})
export class EmployeePageComponent extends BaseComponent implements OnInit {
  pageRequest: PageRequest = { pageIndex: -1, pageSize: -1 };
  employee: SingleEmployee;
  jobs: Job[] = [];
  quarries: Quarry[] = [];
  employeeForm: FormGroup;

  constructor(
    spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private employeeService: EmployeeService,
    private route: ActivatedRoute,
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
      departureDate: [''],
      emergencyContact: [''],
      hireDate: [''],
      licenseType: [''],
      phone: [''],
      typeOfBlood: [''],
      address: ['']
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const employeeId = params.get('employeeId');
      if (employeeId) {
        this.loadEmployeeDetails(employeeId);
      }
    });
    this.getJobs();
    this.getQuarries();
  }

  loadEmployeeDetails(employeeId: string) {
    this.employeeService.getEmployeeById(employeeId, () => {}).then((response) => {
      this.employee = response;
      
      this.employeeForm = this.fB.group({
        firstName: [this.employee.firstName],
        lastName: [this.employee.lastName],
        jobName: [this.employee.jobName],
        quarryName: [this.employee.quarryName],
        birthDate: [this.employee.birthDate],
        departureDate: [this.employee.departureDate],
        emergencyContact: [this.employee.emergencyContact],
        hireDate: [this.employee.hireDate],
        licenseType: [this.employee.licenseType],
        phone: [this.employee.phone],
        typeOfBlood: [this.employee.typeOfBlood],
        address: [this.employee.address]
      });
    });
  }

  async updateEmployee(formValue: any) {
    const update_employee: SingleEmployee = {
      id: this.employee.id,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      jobName: formValue.jobName,
      quarryName: formValue.quarryName,
      birthDate: new Date(formValue.birthDate),
      departureDate: new Date(formValue.departureDate),
      emergencyContact: formValue.emergencyContact,
      employeeImageFiles: this.employee.employeeImageFiles,
      address: formValue.address,
      hireDate: new Date(formValue.hireDate),
      licenseType: formValue.licenseType,
      phone: formValue.phone,
      typeOfBlood: formValue.typeOfBlood,
      jobId: this.getIdFromItems(this.jobs, formValue.jobName),
      quarryId: this.getIdFromItems(this.quarries, formValue.quarryName),
    };

    await this.employeeService.update(update_employee, () => {
      this.loadEmployeeDetails(this.employee.id);
      this.toastr.success('Çalışan başarıyla güncellendi.');
    }, (errorMessage: string) => {
      this.toastr.error(errorMessage);
    });
  }

  private getIdFromItems(items: any[], value: string): string | null {
    const item = items.find(item => item.name === value);
    return item ? item.id : null;
  }

  async getJobs() {
    await this.jobService.list(this.pageRequest.pageIndex, this.pageRequest.pageSize, () => {}, (errorMessage: string) => {})
      .then((response) => {
        this.jobs = response.items;
      });
  }

  async getQuarries() {
    await this.quarryService.list(this.pageRequest.pageIndex, this.pageRequest.pageSize, () => {}, (errorMessage: string) => {})
      .then((response) => {
        this.quarries = response.items;
      });
  }
}
