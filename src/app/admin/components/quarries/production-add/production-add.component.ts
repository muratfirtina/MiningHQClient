import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateQuarryProduction } from 'src/app/contracts/quarryProduction/create-quarry-production';
import { QuarryProductionService } from 'src/app/services/common/models/quarry-production.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';

@Component({
  selector: 'app-production-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './production-add.component.html',
  styleUrls: ['./production-add.component.scss']
})
export class ProductionAddComponent extends BaseComponent implements OnInit {
  
  @Input() quarryId!: string;
  @Output() productionAdded: EventEmitter<void> = new EventEmitter();
  
  production: CreateQuarryProduction = new CreateQuarryProduction();
  
  constructor(
    spinner: NgxSpinnerService,
    private productionService: QuarryProductionService,
    private toastr: ToastrService
  ) {
    super(spinner);
  }

  ngOnInit(): void {
    this.production.quarryId = this.quarryId;
    
    // Varsayılan olarak bu haftanın başlangıç ve bitiş tarihlerini ayarla
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    this.production.weekStartDate = monday;
    this.production.weekEndDate = sunday;
    this.production.productionUnit = 'ton';
    this.production.stockUnit = 'ton';
    this.production.salesUnit = 'ton';
  }

  async addProduction(): Promise<void> {
    if (!this.validateForm()) {
      return;
    }

    this.showSpinner(SpinnerType.BallSpinClockwise);
    
    try {
      await this.productionService.add(this.production);
      this.hideSpinner(SpinnerType.BallSpinClockwise);
      this.toastr.success('Üretim verisi başarıyla eklendi');
      this.productionAdded.emit();
      this.resetForm();
    } catch (error) {
      this.hideSpinner(SpinnerType.BallSpinClockwise);
      this.toastr.error('Üretim verisi eklenemedi');
      console.error('Üretim verisi ekleme hatası:', error);
    }
  }

  validateForm(): boolean {
    if (!this.production.weekStartDate || !this.production.weekEndDate) {
      this.toastr.error('Hafta başlangıç ve bitiş tarihleri zorunludur');
      return false;
    }

    if (this.production.weekStartDate > this.production.weekEndDate) {
      this.toastr.error('Bitiş tarihi başlangıç tarihinden önce olamaz');
      return false;
    }

    if (this.production.productionAmount < 0 || this.production.stockAmount < 0 || this.production.salesAmount < 0) {
      this.toastr.error('Miktarlar negatif olamaz');
      return false;
    }

    return true;
  }

  resetForm(): void {
    this.production = new CreateQuarryProduction();
    this.production.quarryId = this.quarryId;
    this.production.productionUnit = 'ton';
    this.production.stockUnit = 'ton';
    this.production.salesUnit = 'ton';
    
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    this.production.weekStartDate = monday;
    this.production.weekEndDate = sunday;
  }
}
