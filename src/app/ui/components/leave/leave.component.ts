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
    this.router.navigate(['personeller/izinler/izinkullanimi']);
  }

  gottoEmployeeAdd() {
    this.router.navigate(['personeller/personel-ekle']);
  }

  navigateToEntitledLeave() {
    this.router.navigate(['personeller/izinler/hakedilenizinler']);
  }

  navigateToTimekeeping() {
    this.router.navigate(['personeller/izinler/puantaj']);
  }
}
