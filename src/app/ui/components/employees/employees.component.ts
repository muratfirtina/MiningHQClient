import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent } from 'src/app/base/base.component';
import { EmployeeAddComponent } from './employee-add/employee-add.component';
import { DynamicLoadComponentDirective } from 'src/app/directives/common/dynamic-load-component.directive';
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Filter, DynamicQuery } from 'src/app/contracts/dynamic-query';
import { EmployeefilterByDynamic } from 'src/app/contracts/employee/employeeFilterByDynamic';
import { EmployeeFilterList } from 'src/app/contracts/employee/employeeFilterList';
import { SingleEmployee } from 'src/app/contracts/employee/single-employee';
import { Job } from 'src/app/contracts/job/job';
import { Quarry } from 'src/app/contracts/quarry/quarry';
import { TypeOfBlood } from 'src/app/contracts/typeOfBlood';
import { EmployeeService } from 'src/app/services/common/models/employee.service';
import { JobService } from 'src/app/services/common/models/job.service';
import { QuarryService } from 'src/app/services/common/models/quarry.service';
import { CommonModule } from '@angular/common';


@Component({
    selector: 'app-employees',
    templateUrl: './employees.component.html',
    styleUrls: ['./employees.component.scss', '../../../../styles.scss'],
    host: {
        componentId: 'ui-employees'
    },
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class EmployeesComponent extends BaseComponent implements OnInit {
  
  searchForm: FormGroup;
  employees: SingleEmployee[] = [];
  quarries: Quarry[] = [];
  jobs:Job[] = [];
  filterlist: EmployeeFilterList[] = [];
  typeOfBlood = Object.values(TypeOfBlood).filter(value => typeof value === 'string');
  

  
  
  constructor(spinner:NgxSpinnerService,private router: Router, private fb: FormBuilder, private employeeService: EmployeeService, private quarryService: QuarryService , private jobService: JobService) {
    super(spinner);

    this.searchForm = this.fb.group({
      quarryName: [''],
      sortDirection: ['asc'],
      jobName: [''],
      typeOfBlood: ['']
    });
    
  }

  async ngOnInit() {
    
  
  this.getQuarries();
  this.getJobs();
  this.typeOfBlood
  
}
  
  gotoEmployeeList(){
    this.router.navigate(['/employee-list']);
  }

  gottoEmployeeAdd() {
    this.router.navigate(['/employee-add']);
  }

  goToEmployeePage(id: string) {
    this.router.navigate(['/employee', id]);
  }

  navigateToLeave() {
    this.router.navigate(['/leave']);
  }

  getQuarries() {
    this.quarryService.list(-1, -1).then((response) => {
      this.quarries = response.items;

    });
  }

  getJobs() {
    this.jobService.list(-1, -1).then((response) => {
      this.jobs = response.items;
    });
  }

  searchEmployees() {
    const formValue = this.searchForm.value;
    let filters: Filter[] = [];
    const jobName = EmployeefilterByDynamic.jobName;
    const quarryName = EmployeefilterByDynamic.quarryName;
    const typeOfBlood = EmployeefilterByDynamic.typeOfBlood;
    const firstName = EmployeefilterByDynamic.firstName;
  
    // Filtre oluşturucu fonksiyon
    const addFilter = (field: string, value: string) => {
      if (value) { // Eğer değer boş değilse filtreye ekle
        filters.push({ field: field, operator: "eq", value: value });
      }
    };
  
    // Kullanıcı girişlerine dayalı olarak filtreleri oluştur
    addFilter(jobName, formValue.jobName);
    addFilter(quarryName, formValue.quarryName);
    addFilter(typeOfBlood, formValue.typeOfBlood);
    addFilter(firstName, formValue.firstName);
  
    // Tüm filtreleri birleştir
    let dynamicFilter: Filter | undefined;
    if (filters.length > 0) {
      dynamicFilter = filters.length === 1 ? filters[0] : {
        field: "",
        operator: "",
        logic: "and",
        filters: filters
      };
    }
  
    // Dinamik sorguyu oluştur
    const dynamicQuery: DynamicQuery = {
      sort: [{ field: firstName, dir: formValue.sortDirection }],
      filter: dynamicFilter
    };
  
    // API çağrısını yap
    const pageRequest = {
      pageIndex: 0,
      pageSize: 10
    };
  
    this.employeeService.getEmployeesByDynamicQuery(dynamicQuery, pageRequest).then((response) => {
      this.employees = response.items;
    });
  }
}
