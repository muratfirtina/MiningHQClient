import { Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent } from 'src/app/base/base.component';
import { ComponentName, DynamicLoadComponentService } from 'src/app/services/common/dynamic-load-component.service';
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

  @ViewChild(DynamicLoadComponentDirective, { static: true })
  dynamicLoadComponentDirective!: DynamicLoadComponentDirective;
  
 constructor(spinner:NgxSpinnerService, private router: Router, private dynamicLoadComponentService: DynamicLoadComponentService) {
    super(spinner);
  }

  async ngOnInit() {

  }
  
  gotoEmployeeList(){
    this.router.navigate(['/employee-list']);
  }

  loadComponent() {
    this.dynamicLoadComponentService.loadComponent(ComponentName.EmployeeAddComponent, this.dynamicLoadComponentDirective.viewContainerRef);
  }
}
