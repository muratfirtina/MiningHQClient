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
export class LeaveComponent extends BaseComponent {
  
  constructor(spinner: NgxSpinnerService, private router: Router) {
    super(spinner);
  }

  async ngOnInit() {
    // Sayfa yüklendiğinde gerekli işlemler
  }
  
  // Ana navigasyon fonksiyonları
  navigateToTimekeeping() {
    this.router.navigate(['personeller/puantaj/puantaj-tablosu']);
  }

  navigateToLeaveUsage() {
    this.router.navigate(['personeller/puantaj/mesai-takip']);
  }

  navigateToEntitledLeave() {
    this.router.navigate(['personeller/puantaj/izinislemleri']);
  }

  // Ek kısayol fonksiyonları
  navigateToEmployeeList() {
    this.router.navigate(['personeller']);
  }

  navigateToLeaveReports() {
    this.router.navigate(['personeller/puantaj/raporlar']);
  }

  navigateToOvertime() {
    this.router.navigate(['personeller/puantaj/fazla-mesai']);
  }

  navigateToShiftManagement() {
    this.router.navigate(['personeller/puantaj/vardiya']);
  }

  navigateToLeaveBalance() {
    this.router.navigate(['personeller/puantaj/izin-bakiye']);
  }

  goBack() {
    this.router.navigate(['personeller']);
  }
}