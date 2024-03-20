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
import { Employee } from 'src/app/contracts/employee/employee';
import { PageRequest } from 'src/app/contracts/pageRequest';
import { UppercaseinputDirective } from 'src/app/directives/common/uppercaseinput.directive';
import { DepartmentService } from 'src/app/services/common/models/department.service';
import { ListDepartment } from 'src/app/contracts/department/listDepartment';


@Component({
    selector: 'app-employees',
    templateUrl: './employees.component.html',
    styleUrls: ['./employees.component.scss', '../../../../styles.scss'],
    host: {
        componentId: 'ui-employees'
    },
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule,UppercaseinputDirective]
})
export class EmployeesComponent extends BaseComponent implements OnInit {
  
  searchForm: FormGroup;
  employees: SingleEmployee[] = [];
  departments: ListDepartment[] = [];
  quarries: Quarry[] = [];
  jobs:Job[] = [];
  typeOfBlood = Object.values(TypeOfBlood).filter(value => typeof value === 'string');
  currentPageNo: number = 1;
  pageSize: number = 10;
  pages: number;
  pageList: number[] = [];
  pageEmployee: Employee[] = [];
  

  
  
  constructor(spinner:NgxSpinnerService,
    private router: Router, 
    private fb: FormBuilder, 
    private employeeService: EmployeeService, 
    private quarryService: QuarryService , 
    private jobService: JobService,
    private departmentService: DepartmentService,) {
    super(spinner);

    this.searchForm = this.fb.group({
      quarryName: [''],
      sortDirection: ['asc'],
      jobName: [''],
      typeOfBlood: [''],
      nameSearch: [''],
      departmentName: ['']
    });
    
  }

  async ngOnInit() {
    
  
  this.getQuarries();
  this.getJobs();
  this.getDepatments();
  this.typeOfBlood

  this.searchForm.get('nameSearch')!.valueChanges.subscribe((value: string) => {
    if (value.length >= 3 || value.length === 0) { // En az 3 karakter girildiğinde veya input temizlendiğinde
      this.searchEmployees(); // Arama fonksiyonunu çağır
    }
  });
  
}
  
  gotoEmployeeList(){
    this.router.navigate(['personeller/personel-listesi']);
  }

  gottoEmployeeAdd() {
    this.router.navigate(['personeller/personel-ekle']);
  }

  goToEmployeePage(id: string) {
    this.router.navigate(['personeller/personel', id]);
  }

  navigateToLeave() {
    this.router.navigate(['personeller/puantaj']);
  }

  getQuarries() {
    this.quarryService.list(-1, -1).then((response) => {
      this.quarries = response.items;

    });
  }

  getDepatments() {
    this.departmentService.list(-1, -1).then((response) => {
      this.departments = response.items;
    });
  }

  getJobs() {
    this.jobService.list(-1, -1).then((response) => {
      this.jobs = response.items;
    });
  }

  async searchEmployees() {
    const formValue = this.searchForm.value;
    let filters: Filter[] = [];
    const jobName = EmployeefilterByDynamic.jobName;
    const departmentName = EmployeefilterByDynamic.departmentName;
    const quarryName = EmployeefilterByDynamic.quarryName;
    const typeOfBlood = EmployeefilterByDynamic.typeOfBlood;
    const firstName = EmployeefilterByDynamic.firstName;
    const lastName = EmployeefilterByDynamic.lastName;
    
    // Filtre oluşturucu fonksiyon
    const addFilter = (field: string, value: string) => {
      if (value) { // Eğer değer boş değilse filtreye ekle
        filters.push({ field: field, operator: "eq", value: value });
      }
    };

    if (formValue.nameSearch) {
      const nameFilter: Filter = {
        field: firstName,
        operator: "startswith",
        value: formValue.nameSearch,
        logic: "or",
        filters: [
          {
            field: lastName,
            operator: "startswith",
            value: formValue.nameSearch,
          }
        ]

      };
  
      filters.push(nameFilter);
    }
    // Kullanıcı girişlerine dayalı olarak filtreleri oluştur
    addFilter(jobName, formValue.jobName);
    addFilter(quarryName, formValue.quarryName);
    addFilter(typeOfBlood, formValue.typeOfBlood);
    addFilter(firstName, formValue.firstName);
    addFilter(departmentName, formValue.departmentName);
  
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
    const pageRequest: PageRequest = { pageIndex: this.currentPageNo -1, pageSize: this.pageSize };
  
    await this.employeeService.getEmployeesByDynamicQuery(dynamicQuery, pageRequest).then((response) => {
      this.employees = response.items;
      this.pageEmployee = response.items;
      this.pages = response.pages;
      this.initializePagination();

    });
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

  changePage(pageNo: number) {
    this.currentPageNo = pageNo;
    this.searchEmployees(); // Her sayfa değişikliğinde listeyi güncelle
  }

  
}
