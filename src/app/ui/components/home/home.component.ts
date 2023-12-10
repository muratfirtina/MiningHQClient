import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent } from 'src/app/base/base.component';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    standalone: true
})
export class HomeComponent extends BaseComponent{
  
  constructor(spinner:NgxSpinnerService,private router: Router) {
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

  navigateToLeave() {
    this.router.navigate(['/leave']);
  }
 }
