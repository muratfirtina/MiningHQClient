import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent } from 'src/app/base/base.component';

@Component({
  selector: 'app-quarries',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quarries.component.html',
  styleUrls: ['./quarries.component.scss']
})
export class QuarriesComponent extends BaseComponent implements OnInit {

  constructor(spinner: NgxSpinnerService) {
    super(spinner);
   }


  ngOnInit(): void {
    
  }

}
