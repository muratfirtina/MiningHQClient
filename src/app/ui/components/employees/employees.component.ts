import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Filter, DynamicQuery } from 'src/app/contracts/dynamic-query';
import { EmployeefilterByDynamic } from 'src/app/contracts/employee/employeeFilterByDynamic';
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
import { BloodTypeDisplayPipe } from 'src/app/pipes/bloodTypeDisplay.pipe';

@Component({
    selector: 'app-employees',
    templateUrl: './employees.component.html',
    styleUrls: ['./employees.component.scss', '../../../../styles.scss'],
    host: {
        componentId: 'ui-employees'
    },
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, UppercaseinputDirective, BloodTypeDisplayPipe]
})
export class EmployeesComponent extends BaseComponent implements OnInit {
  
  searchForm: FormGroup;
  employees: SingleEmployee[] = [];
  departments: ListDepartment[] = [];
  quarries: Quarry[] = [];
  jobs: Job[] = [];
  typeOfBlood = Object.values(TypeOfBlood).filter(value => typeof value === 'string');
  
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
  
  currentPageNo: number = 1;
  pageSize: number = 10;
  pages: number = 0;
  pageList: number[] = [];
  pageEmployee: Employee[] = [];
  
  // Loading states
  isLoading = false;
  isSearching = false;
  
  constructor(
    spinner: NgxSpinnerService,
    private router: Router, 
    private fb: FormBuilder, 
    private employeeService: EmployeeService, 
    private quarryService: QuarryService, 
    private jobService: JobService,
    private departmentService: DepartmentService,
  ) {
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
    this.showSpinner(SpinnerType.BallSpinClockwise);
    
    try {
      await Promise.all([
        this.getQuarries(),
        this.getJobs(),
        this.getDepatments()
      ]);
      
      // Initial search to load all employees
      await this.searchEmployees();
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      this.hideSpinner(SpinnerType.BallSpinClockwise);
    }

    // Setup real-time search
    this.searchForm.get('nameSearch')!.valueChanges.subscribe((value: string) => {
      if (value.length >= 3 || value.length === 0) {
        this.searchEmployees();
      }
    });
  }
  
  // Performance optimization for *ngFor
  trackByEmployeeId(index: number, employee: SingleEmployee): string {
    return employee.id;
  }
  
  // Navigation methods
  gotoEmployeeList() {
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

  // Data loading methods
  async getQuarries() {
    try {
      const response = await this.quarryService.list(-1, -1);
      this.quarries = response.items;
    } catch (error) {
      console.error('Error loading quarries:', error);
    }
  }

  async getDepatments() {
    try {
      const response = await this.departmentService.list(-1, -1);
      this.departments = response.items;
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  }

  async getJobs() {
    try {
      const response = await this.jobService.list(-1, -1);
      this.jobs = response.items;
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  }

  async searchEmployees() {
    if (this.isSearching) return; // Prevent multiple simultaneous searches
    
    this.isSearching = true;
    const formValue = this.searchForm.value;
    let filters: Filter[] = [];
    
    // Filter field mappings
    const jobName = EmployeefilterByDynamic.jobName;
    const departmentName = EmployeefilterByDynamic.departmentName;
    const quarryName = EmployeefilterByDynamic.quarryName;
    const typeOfBlood = EmployeefilterByDynamic.typeOfBlood;
    const firstName = EmployeefilterByDynamic.firstName;
    const lastName = EmployeefilterByDynamic.lastName;
    
    // Helper function to add filters
    const addFilter = (field: string, value: string) => {
      if (value && value.trim()) {
        filters.push({ field: field, operator: "eq", value: value.trim() });
      }
    };

    // Name search with OR logic
    if (formValue.nameSearch && formValue.nameSearch.trim()) {
      const nameFilter: Filter = {
        field: firstName,
        operator: "startswith",
        value: formValue.nameSearch.trim(),
        logic: "or",
        filters: [
          {
            field: lastName,
            operator: "startswith",
            value: formValue.nameSearch.trim(),
          }
        ]
      };
      filters.push(nameFilter);
    }
    
    // Add other filters
    addFilter(jobName, formValue.jobName);
    addFilter(quarryName, formValue.quarryName);
    addFilter(typeOfBlood, formValue.typeOfBlood);
    addFilter(departmentName, formValue.departmentName);
  
    // Combine all filters
    let dynamicFilter: Filter | undefined;
    if (filters.length > 0) {
      dynamicFilter = filters.length === 1 ? filters[0] : {
        field: "",
        operator: "",
        logic: "and",
        filters: filters
      };
    }
  
    // Create dynamic query
    const dynamicQuery: DynamicQuery = {
      sort: [{ field: firstName, dir: formValue.sortDirection || 'asc' }],
      filter: dynamicFilter
    };
  
    // Make API call
    const pageRequest: PageRequest = { 
      pageIndex: this.currentPageNo - 1, 
      pageSize: this.pageSize 
    };
  
    try {
      const response = await this.employeeService.getEmployeesByDynamicQuery(dynamicQuery, pageRequest);
      this.employees = response.items || [];
      this.pageEmployee = response.items || [];
      this.pages = response.pages || 0;
      this.initializePagination();
    } catch (error) {
      console.error('Error searching employees:', error);
      this.employees = [];
      this.pageEmployee = [];
      this.pages = 0;
    } finally {
      this.isSearching = false;
    }
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
    if (pageNo < 1 || pageNo > this.pages || pageNo === this.currentPageNo) {
      return;
    }
    
    this.currentPageNo = pageNo;
    this.searchEmployees();
  }

  // Filter reset method
  resetFilters() {
    this.searchForm.reset({
      quarryName: '',
      sortDirection: 'asc',
      jobName: '',
      typeOfBlood: '',
      nameSearch: '',
      departmentName: ''
    });
    this.currentPageNo = 1;
    this.searchEmployees();
  }

  // Export functionality (placeholder)
  exportData() {
    console.log('Export functionality to be implemented');
    // Implement export logic here
  }
}