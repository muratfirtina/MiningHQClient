import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent } from 'src/app/base/base.component';
import { DynamicQuery, Filter } from 'src/app/contracts/dynamic-query';
import { EmployeefilterByDynamic } from 'src/app/contracts/employee/EmployeefilterByDynamic';
import { Employee } from 'src/app/contracts/employee/employee';
import { SingleEmployee } from 'src/app/contracts/employee/single-employee';
import { Job } from 'src/app/contracts/job/job';
import { Quarry } from 'src/app/contracts/quarry/quarry';
import { TypeOfBlood } from 'src/app/contracts/typeOfBlood';
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
  employees: EmployeefilterByDynamic[] = [];
  quarries: Quarry[] = [];
  jobs:Job[] = [];
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
    const employeeFilterByDynamic: EmployeefilterByDynamic = {
      id: 'Employee.Id',
      firstName: "Employee.FirstName",
      lastName: "Employee.LastName",
      jobName: "Job.Name",
      quarryName: "Quarry.Name",
      typeOfBlood: "TypeOfBlood"
    };

  
    const dynamicQuery: DynamicQuery = {
      sort: [{
        field: employeeFilterByDynamic.jobName ,
        dir: formValue.sortDirection
      }],
      filter: {
        field: employeeFilterByDynamic.jobName,
        operator: "eq",
        value: formValue.jobName,
        logic: "or",
        filters: [
          
        ]
      }
    };
    
    if (formValue.jobName == "" && formValue.quarryName != "" && formValue.typeOfBlood != "") {
      dynamicQuery.filter = {
        field: employeeFilterByDynamic.quarryName,
        operator: "eq",
        value: formValue.quarryName,
        logic: "and",
        filters: [
          {
            field: employeeFilterByDynamic.typeOfBlood,
            operator: "eq",
            value: formValue.typeOfBlood
          }
          
        ]
      };
    }
    else if (formValue.quarryName == "" && formValue.jobName != "" && formValue.typeOfBlood != "") {
      dynamicQuery.filter = {
        field: employeeFilterByDynamic.jobName,
        operator: "eq",
        value: formValue.jobName,
        logic: "and",
        filters: [
          {
            field: employeeFilterByDynamic.typeOfBlood,
            operator: "eq",
            value: formValue.typeOfBlood
          }
          
        ]
      };
    }
    else if (formValue.jobName == "" && formValue.quarryName == "" && formValue.typeOfBlood != "") {
      dynamicQuery.filter = {
        field: employeeFilterByDynamic.typeOfBlood,
        operator: "eq",
        value: formValue.typeOfBlood,
        logic: "and",
        filters: [
          
        ]
      };
    }
    else if (formValue.jobName == "" && formValue.quarryName == "" && formValue.typeOfBlood == "") {
      dynamicQuery.filter = {
        field: "",
        operator: "",
        value: "",
        logic: "",
        filters: [
          
          
        ]
      };
    }
    else if (formValue.jobName != "" && formValue.quarryName != "" && formValue.typeOfBlood != "") {
      dynamicQuery.filter = {
        field: employeeFilterByDynamic.jobName,
        operator: "eq",
        value: formValue.jobName,
        logic: "and",
        filters: [
          {
            field: employeeFilterByDynamic.quarryName,
            operator: "eq",
            value: formValue.quarryName,
            logic: "and",
            filters: [
              {
                field: employeeFilterByDynamic.typeOfBlood,
                operator: "eq",
                value: formValue.typeOfBlood
              }
            ]
          }
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


}
