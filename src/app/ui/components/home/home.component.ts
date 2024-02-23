import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent } from 'src/app/base/base.component';
import { DynamicQuery, Filter } from 'src/app/contracts/dynamic-query';
import { Employee } from 'src/app/contracts/employee/employee';
import { SingleEmployee } from 'src/app/contracts/employee/single-employee';
import { Job } from 'src/app/contracts/job/job';
import { Quarry } from 'src/app/contracts/quarry/quarry';
import { EmployeeService } from 'src/app/services/common/models/employee.service';
import { JobService } from 'src/app/services/common/models/job.service';
import { QuarryService } from 'src/app/services/common/models/quarry.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class HomeComponent extends BaseComponent implements OnInit{

  searchForm: FormGroup;
  employees: Employee[] = [];
  quarries: Quarry[] = [];
  jobs:Job[] = [];
  

  
  
  constructor(spinner:NgxSpinnerService,private router: Router, private fb: FormBuilder, private employeeService: EmployeeService, private quarryService: QuarryService , private jobService: JobService) {
    super(spinner);

    this.searchForm = this.fb.group({
      quarryName: [''],
      sortDirection: ['asc'],
      jobName: ['']
    });
    
  }

  async ngOnInit() {
    
  
  this.getQuarries();
  this.getJobs();
  
}
  
  gotoEmployeeList(){
    this.router.navigate(['/employee-list']);
  }

  gottoEmployeeAdd() {
    this.router.navigate(['/employee-add']);
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
  
    const dynamicQuery: DynamicQuery = {
      sort: [{
        field: "Job.Name",
        dir: formValue.sortDirection
      }],
      filter: {
        field: "Job.Name",
        operator: "eq",
        value: formValue.jobName,
        logic: "and",
        filters: [
          {
            field: "Quarry.Name",
            operator: "eq",
            value: formValue.quarryName
          }
        ]
      }
    };
    if (formValue.jobName == "" && formValue.quarryName != "") {
      dynamicQuery.filter = {
        field: "Quarry.Name",
        operator: "eq",
        value: formValue.quarryName,
        logic: "and",
        filters: [
          
        ]
      };
    }
    else if (formValue.quarryName == "" && formValue.jobName != "") {
      dynamicQuery.filter = {
        field: "Job.Name",
        operator: "eq",
        value: formValue.jobName,
        logic: "and",
        filters: [
          
        ]
      };
    }
    else if (formValue.jobName == "" && formValue.quarryName == "") {
      dynamicQuery.filter = {
        field: "",
        operator: "",
        value: "",
        logic: "",
        filters: [
          
        ]
      };
    }

  
    const pageRequest = {
      pageIndex: 0,
      pageSize: 10
    };
  
    this.employeeService.getEmployeesByDynamicQuery(dynamicQuery, pageRequest).then((response) => {
      this.employees = response.items;
    });
  }



  searchEmployees2() {
    const formValue = this.searchForm.value;
    const dynamicQuery = {
      filter: {
        field: "Job.Name",
        operator: "eq",
        value: formValue.jobName,
        logic: "and",
        filters: [
          {
            field: "Quarry.Name",
            operator: "eq",
            value: formValue.quarryName
          }
        ]
      },
      sort: [{
        field: "Job.Name",
        dir: formValue.sortDirection
      }],
    };

    if (formValue.jobName == "" && formValue.quarryName != "") {
      dynamicQuery.filter = {
        field: "Quarry.Name",
        operator: "eq",
        value: formValue.quarryName,
        logic: "and",
        filters: [
          
        ]
      };
    } else if (formValue.quarryName == "" && formValue.jobName != "") {
      dynamicQuery.filter = {
        field: "Job.Name",
        operator: "eq",
        value: formValue.jobName,
        logic: "and",
        filters: [
          
        ]
      };
    } else if (formValue.jobName == "" && formValue.quarryName == "") {
      dynamicQuery.filter = {
        field: "",
        operator: "",
        value: "",
        logic: "",
        filters: [
          
        ]
      };
    }

    const pageRequest = {
      pageIndex: 0,
      pageSize: 10
    };

    this.employeeService.getEmployeesByDynamicQuery(dynamicQuery, pageRequest).then((response) => {
      this.employees = response.items;
    });
 }

 getBackendFieldName(model: Employee, fieldName: string) {
  const modelKeys = Object.keys(model);
  const index = modelKeys.indexOf(fieldName);
  if (index !== -1) {
    // Assuming the backend field names follow a specific pattern
    return fieldName.charAt(0).toUpperCase() + fieldName.slice(1); // e.g., "quarryName" -> "Quarry.Name"
  } else {
    // Handle invalid field name
    throw new Error(`Invalid field name: ${fieldName}`);
  }
}


}
