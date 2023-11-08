import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateBrand } from 'src/app/contracts/brand/create-brand';
import { BrandService } from 'src/app/services/common/models/brand.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';

@Component({
  selector: 'app-brand-add',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './brand-add.component.html',
  styleUrls: ['./brand-add.component.scss','../../../../../styles.scss']
})
export class BrandAddComponent extends BaseComponent implements OnInit {

  @Output() createdBrand : EventEmitter<CreateBrand>= new EventEmitter();

  constructor(spinner: NgxSpinnerService, private brandService: BrandService, private toastr: ToastrService) {
    super(spinner);
   }


  ngOnInit(): void {
    
  }

  addBrand(brandName: HTMLInputElement){
    const create_brand : CreateBrand = new CreateBrand();
    create_brand.name = brandName.value;

    this.showSpinner(SpinnerType.BallSpinClockwise);
    this.brandService.add(create_brand, () => {
      this.hideSpinner(SpinnerType.BallSpinClockwise);
      this.toastr.success("Marka başarıyla eklendi.");
      
      this.createdBrand.emit(create_brand);
    }
    , (errorMessage: string) => {
      this.toastr.error("Marka eklenemedi");
      
    });

    
    setTimeout(() => {
      location.reload();
    }, 1500);
  }

}