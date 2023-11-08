import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateQuarry } from 'src/app/contracts/quarry/create-quarry';
import { QuarryService } from 'src/app/services/common/models/quarry.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';

@Component({
  selector: 'app-quarry-add',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quarry-add.component.html',
  styleUrls: ['./quarry-add.component.scss','../../../../../styles.scss']
})
export class QuarryAddComponent extends BaseComponent implements OnInit {

  @Output() createdQuarry : EventEmitter<CreateQuarry>= new EventEmitter();

  constructor(spinner: NgxSpinnerService, private quarryService: QuarryService, private toastr: ToastrService) {
    super(spinner);
   }


  ngOnInit(): void {
    
  }

  addQuarry(quarryName: HTMLInputElement){
    const create_quarry : CreateQuarry = new CreateQuarry();
    create_quarry.name = quarryName.value;

    this.showSpinner(SpinnerType.BallSpinClockwise);
    this.quarryService.add(create_quarry, () => {
      this.hideSpinner(SpinnerType.BallSpinClockwise);
      this.toastr.success("Ocak başarıyla eklendi.");
      
      this.createdQuarry.emit(create_quarry);
    }
    , (errorMessage: string) => {
      this.toastr.error("Ocak eklenemedi");
      
    });

    
    setTimeout(() => {
      location.reload();
    }, 1500);
  }

}