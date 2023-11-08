import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent } from 'src/app/base/base.component';

@Component({
  selector: 'app-machine-types',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './machine-types.component.html',
  styleUrls: ['./machine-types.component.scss']
})
export class MachineTypesComponent extends BaseComponent implements OnInit {

  constructor(spinner: NgxSpinnerService) {
    super(spinner);
   }


  ngOnInit(): void {
    
  }

}
