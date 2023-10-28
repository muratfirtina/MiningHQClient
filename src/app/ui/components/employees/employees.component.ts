import { Component} from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent } from 'src/app/base/base.component';

@Component({
    selector: 'app-employees',
    templateUrl: './employees.component.html',
    styleUrls: ['./employees.component.scss'],
    host: {
        componentId: 'ui-employees'
    },
    standalone: true
})
export class EmployeesComponent extends BaseComponent {
  
 constructor(spinner:NgxSpinnerService, private router: Router) {
    super(spinner);
  }
  
  gotoEmployeeList(){
    this.router.navigate(['/employee-list']);
  }
}
