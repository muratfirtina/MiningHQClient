import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from 'src/app/base/base.component';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-leave',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leave.component.html',
  styleUrls: ['./leave.component.scss']
})
export class LeaveComponent extends BaseComponent{
  
  constructor(spinner:NgxSpinnerService,private router: Router) {
    super(spinner);
  }

  async ngOnInit() {

  }
  
  navigateToLeaveUsage(){
    this.router.navigate(['/leaveusage']);
  }

  gottoEmployeeAdd() {
    this.router.navigate(['/employee-add']);
  }

  navigateToEntitledLeave() {
    this.router.navigate(['leave/entitledleave']);
  }

  navigateToTimekeeping() {
    this.router.navigate(['leave/timekeeping']);
  }
}
