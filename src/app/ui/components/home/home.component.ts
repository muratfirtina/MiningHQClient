import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent } from 'src/app/base/base.component';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    standalone: true,
    imports: [CommonModule]
})
export class HomeComponent extends BaseComponent implements OnInit{

  constructor(spinner: NgxSpinnerService, private router: Router) {
    super(spinner);
  }

  async ngOnInit() {
    // Sayfa yüklendiğinde gerekli işlemler
  }
  
  // Ana navigasyon fonksiyonları
  gotoEmployees() {
    this.router.navigate(['/personeller']);
  }

  gotoMachines() {
    this.router.navigate(['/makinalar']);
  }

  // Personel kısayolları
  gotoEmployeeList() {
    this.router.navigate(['/personeller']);
  }

  gotoEmployeeAdd() {
    this.router.navigate(['/personeller/personel-ekle']);
  }

  gotoLeaveManagement() {
    this.router.navigate(['/personeller/puantaj']);
  }

  /* gotoAttendance() {
    this.router.navigate(['/puantaj']);
  } */

  gotoEmployeeReports() {
    this.router.navigate(['/personel-raporlari']);
  }

  // Makina kısayolları
  gotoMachineList() {
    this.router.navigate(['/makinalar']);
  }

  gotoMachineAdd() {
    this.router.navigate(['/makinalar/ekle']);
  }

  gotoMaintenance() {
    this.router.navigate(['/bakim']);
  }

  gotoMachineReports() {
    this.router.navigate(['/makina-raporlari']);
  }

  gotoInventory() {
    this.router.navigate(['/envanter']);
  }
}