import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent } from 'src/app/base/base.component';
import { DynamicQuery, Filter } from 'src/app/contracts/dynamic-query';
import { EmployeefilterByDynamic } from 'src/app/contracts/employee/employeeFilterByDynamic';
import { EmployeeFilterList } from 'src/app/contracts/employee/employeeFilterList';
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
    imports: []
})
export class HomeComponent extends BaseComponent implements OnInit{


  constructor(spinner:NgxSpinnerService,private router: Router) {
    super(spinner);
  }

  async ngOnInit() {
  
  
}
  
  gotoEmployees(){
    this.router.navigate(['/employees']);
  }

  gottoMachines() {
    this.router.navigate(['/machines']);
  }

}
