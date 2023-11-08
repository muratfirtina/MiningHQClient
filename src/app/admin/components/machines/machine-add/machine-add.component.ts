import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { CreateMachine } from 'src/app/contracts/machine/create-machine';
import { NgxSpinnerService } from 'ngx-spinner';
import { MachineService } from 'src/app/services/common/models/machine.service';
import { ToastrService } from 'ngx-toastr';
import { PageRequest } from 'src/app/contracts/pageRequest';
import { BrandService } from 'src/app/services/common/models/brand.service';
import { ModelService } from 'src/app/services/common/models/model.service';
import { MachineTypeService } from 'src/app/services/common/models/machine-type.service';
import { Brand } from 'src/app/contracts/brand/brand';
import { MachineType } from 'src/app/contracts/machine-type/machine-type';
import { Model } from 'src/app/contracts/model/model';
import { Quarry } from 'src/app/contracts/quarry/quarry';
import { QuarryService } from 'src/app/services/common/models/quarry.service';


@Component({
  selector: 'app-machine-add',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './machine-add.component.html',
  styleUrls: ['./machine-add.component.scss','../../../../../styles.scss']
})
export class MachineAddComponent extends BaseComponent implements OnInit {

  @Output() createdMachine : EventEmitter<CreateMachine>= new EventEmitter();

  pageRequest: PageRequest = { pageIndex: -1, pageSize: -1 };

  quarries: Quarry[] = [];
  brands:Brand[] = [];
  models:Model[] = [];
  machineTypes:MachineType[] = [];


  constructor(spinner: NgxSpinnerService,
    private machineService: MachineService,
    private brandService: BrandService,
    private modelService: ModelService,
    private machinetypeService: MachineTypeService,
    private quarryService: QuarryService,
    private toastr: ToastrService) {
    super(spinner);
   }


  async ngOnInit() {
    await this.getBrands();
    await this.getModels();
    await this.getMachineTypes();
    await this.getQuarries();
    
  }

  addMachine(name: HTMLInputElement, machineType:HTMLSelectElement, brandName:HTMLSelectElement,modelName:HTMLSelectElement,serialNumber:HTMLInputElement,QuarryName:HTMLSelectElement){
    const create_machine : CreateMachine = new CreateMachine();
    create_machine.name = name.value;
    create_machine.machineTypeName = machineType.value;
    create_machine.brandName = brandName.value;
    create_machine.modelName = modelName.value;
    create_machine.serialNumber = serialNumber.value;
    create_machine.quarryName = QuarryName.value;

    create_machine.machineTypeId = this.getIdFromItems(this.machineTypes, machineType.value);
    create_machine.brandId = this.getIdFromItems(this.brands, brandName.value);
    create_machine.modelId = this.getIdFromItems(this.models, modelName.value);
    create_machine.quarryId = this.getIdFromItems(this.quarries, QuarryName.value);
    

    this.showSpinner(SpinnerType.BallSpinClockwise);
    this.machineService.add(create_machine, () => {
      this.hideSpinner(SpinnerType.BallSpinClockwise);
      this.toastr.success("Makina başarıyla eklendi.");
      
      this.createdMachine.emit(create_machine);
    }
    , (errorMessage: string) => {
      this.toastr.error("Makina eklenemedi");
      
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
    this.brands = response.items;
    
    })
    this.hideSpinner(SpinnerType.BallSpinClockwise);
  }
  

  getModels(){
    this.showSpinner(SpinnerType.BallSpinClockwise);
    this.modelService.list(this.pageRequest.pageIndex, this.pageRequest.pageSize, () => {}, (errorMessage: string) => {})
      .then((response) => {
    this.models = response.items;
    
    })
    this.hideSpinner(SpinnerType.BallSpinClockwise);
  }

  getMachineTypes(){
    this.showSpinner(SpinnerType.BallSpinClockwise);
    this.machinetypeService.list(this.pageRequest.pageIndex, this.pageRequest.pageSize, () => {}, (errorMessage: string) => {})
      .then((response) => {
    this.machineTypes = response.items;
    
    })
    this.hideSpinner(SpinnerType.BallSpinClockwise);
  }

  getQuarries(){
    this.showSpinner(SpinnerType.BallSpinClockwise);
    this.quarryService.list(this.pageRequest.pageIndex, this.pageRequest.pageSize, () => {}, (errorMessage: string) => {})
      .then((response) => {
    this.quarries = response.items;
    
    })
    this.hideSpinner(SpinnerType.BallSpinClockwise);
  }
}

