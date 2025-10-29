import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateQuarry } from 'src/app/contracts/quarry/create-quarry';
import { QuarryService } from 'src/app/services/common/models/quarry.service';
import { EmployeeService } from 'src/app/services/common/models/employee.service';
import { Employee } from 'src/app/contracts/employee/employee';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';

@Component({
  selector: 'app-quarry-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quarry-add.component.html',
  styleUrls: ['./quarry-add.component.scss','../../../../../styles.scss']
})
export class QuarryAddComponent extends BaseComponent implements OnInit {

  @Output() createdQuarry : EventEmitter<CreateQuarry>= new EventEmitter();
  
  quarry: CreateQuarry = new CreateQuarry();
  engineers: Employee[] = [];

  constructor(
    spinner: NgxSpinnerService, 
    private quarryService: QuarryService,
    private employeeService: EmployeeService,
    private toastr: ToastrService
  ) {
    super(spinner);
  }

  async ngOnInit(): Promise<void> {
    await this.loadEngineers();
  }

  async loadEngineers(): Promise<void> {
    try {
      const response = await this.employeeService.list(0, 100);
      // Maden mühendislerini filtrele (job title'da 'Mühendis' geçenler)
      this.engineers = response.items.filter(e => 
        e.jobName && e.jobName.toLowerCase().includes('mühendis')
      );
    } catch (error) {
      console.error('Mühendisler yüklenirken hata:', error);
      this.toastr.error('Mühendisler yüklenemedi');
    }
  }

  validateQuarry(): boolean {
    if (!this.quarry.name || this.quarry.name.trim() === '') {
      this.toastr.error('Ocak adı zorunludur');
      return false;
    }

    // UTM Validation
    if (this.quarry.utmEasting || this.quarry.utmNorthing) {
      if (!this.quarry.utmEasting || !this.quarry.utmNorthing) {
        this.toastr.error('UTM koordinatları eksiksiz girilmelidir (hem X hem Y)');
        return false;
      }
      
      // Basic UTM validation for Zone 35T (Turkey)
      if (this.quarry.utmEasting < 166000 || this.quarry.utmEasting > 833000) {
        this.toastr.error('UTM Doğruluk (X) değeri 166,000 ile 833,000 arasında olmalıdır');
        return false;
      }
      
      if (this.quarry.utmNorthing < 0 || this.quarry.utmNorthing > 9329000) {
        this.toastr.error('UTM Kuzeyleme (Y) değeri 0 ile 9,329,000 arasında olmalıdır');
        return false;
      }
    }

    return true;
  }

  async addQuarry(): Promise<void> {
    if (!this.validateQuarry()) {
      return;
    }

    this.showSpinner(SpinnerType.BallSpinClockwise);
    
    try {
      await this.quarryService.add(this.quarry);
      this.hideSpinner(SpinnerType.BallSpinClockwise);
      this.toastr.success('Ocak başarıyla eklendi', 'Başarılı', {
        timeOut: 2000
      });
      this.createdQuarry.emit(this.quarry);
      
      setTimeout(() => {
        location.reload();
      }, 1500);
    } catch (error) {
      this.hideSpinner(SpinnerType.BallSpinClockwise);
      this.toastr.error('Ocak eklenemedi', 'Hata');
      console.error('Ocak ekleme hatası:', error);
    }
  }

}
