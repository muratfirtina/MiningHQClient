import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent } from 'src/app/base/base.component';
import { EmployeeAddComponent } from './employee-add/employee-add.component';
import { DynamicLoadComponentDirective } from 'src/app/directives/common/dynamic-load-component.directive';


@Component({
    selector: 'app-employees',
    templateUrl: './employees.component.html',
    styleUrls: ['./employees.component.scss'],
    host: {
        componentId: 'ui-employees'
    },
    standalone: true,
    imports: [EmployeeAddComponent, DynamicLoadComponentDirective]
})
export class EmployeesComponent extends BaseComponent implements OnInit {
  
 constructor(spinner:NgxSpinnerService, private router: Router) {
    super(spinner);
  }

  async ngOnInit() {

  }
  
  gotoEmployeeList(){
    this.router.navigate(['/employee-list']);
  }

  gottoEmployeeAdd() {
    this.router.navigate(['/employee-add']);
  }
}
