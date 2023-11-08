import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateMachineType } from 'src/app/contracts/machine-type/create-machine-type';
import { MachineTypeService } from 'src/app/services/common/models/machine-type.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';

@Component({
  selector: 'app-machine-type-add',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './machine-type-add.component.html',
  styleUrls: ['./machine-type-add.component.scss','../../../../../styles.scss']
})
export class MachineTypeAddComponent extends BaseComponent implements OnInit {

  @Output() createMachineType : EventEmitter<CreateMachineType>= new EventEmitter();

  constructor(spinner: NgxSpinnerService, private machineTypeService: MachineTypeService, private toastr: ToastrService) {
    super(spinner);
   }


  ngOnInit(): void {
    
  }

  addMachineTypes(machineTypeName: HTMLInputElement){
    const create_machineType : CreateMachineType = new CreateMachineType();
    create_machineType.name = machineTypeName.value;

    this.showSpinner(SpinnerType.BallSpinClockwise);
    this.machineTypeService.add(create_machineType, () => {
      this.hideSpinner(SpinnerType.BallSpinClockwise);
      this.toastr.success("Makine tipi başarıyla eklendi.");
      
      this.createMachineType.emit(create_machineType);
    }
    , (errorMessage: string) => {
      this.toastr.error("Makine tipi eklenemedi");
      
    });

    
    setTimeout(() => {
      location.reload();
    }, 1500);
  }

}

