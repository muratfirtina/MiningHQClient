import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateModel } from 'src/app/contracts/model/create-model';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { Brand } from 'src/app/contracts/brand/brand';
import { PageRequest } from 'src/app/contracts/pageRequest';
import { BrandService } from 'src/app/services/common/models/brand.service';
import { ModelService } from 'src/app/services/common/models/model.service';

@Component({
  selector: 'app-model-add',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './model-add.component.html',
  styleUrls: ['./model-add.component.scss','../../../../../styles.scss']
})
export class ModelAddComponent extends BaseComponent implements OnInit {

  @Output() createModel : EventEmitter<CreateModel>= new EventEmitter();

  pageRequest: PageRequest = { pageIndex: -1, pageSize: -1 };


  brandItems:Brand[] = [];



  constructor(spinner: NgxSpinnerService,
    private brandService: BrandService,
    private modelService: ModelService,
    private toastr: ToastrService) {
    super(spinner);
   }


  async ngOnInit() {
    await this.getBrands();  
  }

  addModel(name: HTMLInputElement, brandName:HTMLSelectElement){
    const create_model : CreateModel = new CreateModel();
    create_model.name = name.value;
    create_model.brandName = brandName.value;
    create_model.brandId = this.getIdFromItems(this.brandItems, brandName.value);

    

    this.showSpinner(SpinnerType.BallSpinClockwise);
    this.modelService.add(create_model, () => {
      this.hideSpinner(SpinnerType.BallSpinClockwise);
      this.toastr.success("Model başarıyla eklendi.");
      
      this.createModel.emit(create_model);
    }
    , (errorMessage: string) => {
      this.toastr.error("Model eklenemedi");
      
    });

    
    /* setTimeout(() => {
      location.reload();
    }, 1500); */
  }

  private getIdFromItems(items: any[], value: string): string | null {
    const item = items.find(item => item.name === value);
    return item ? item.id : null;
  }

  /* private getIdFromItems(items: any[], value: string): number {
    for (let index = 0; index < items.length; index++) {
      if(items[index].name == value){
        return items[index].id.toString(); 
      }
    }
    return ""; 
  } */

  getBrands(){
    this.showSpinner(SpinnerType.BallSpinClockwise);
    this.brandService.list(this.pageRequest.pageIndex, this.pageRequest.pageSize, () => {}, (errorMessage: string) => {})
      .then((response) => {
    this.brandItems = response.items;
    
    })
    this.hideSpinner(SpinnerType.BallSpinClockwise);
  }
 
}

