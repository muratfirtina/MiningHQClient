import { Component } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent } from 'src/app/base/base.component';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss'],
  host: {
    componentId: 'ui-employees'
  }
})
export class EmployeesComponent extends BaseComponent{
  
 constructor(spinner:NgxSpinnerService) {
    super(spinner);
  }

}
