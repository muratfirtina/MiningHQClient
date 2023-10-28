import { Component } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent } from 'src/app/base/base.component';

@Component({
    selector: 'app-machines',
    templateUrl: './machines.component.html',
    styleUrls: ['./machines.component.scss'],
    host: {
        componentId: 'ui-machines'
    },
    standalone: true
})
export class MachinesComponent extends BaseComponent{
  
  constructor(spinner:NgxSpinnerService) {
     super(spinner);
   }
 
 }
