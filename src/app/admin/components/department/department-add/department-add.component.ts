import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateDepartment } from 'src/app/contracts/department/createDepartment';
import { DepartmentService } from 'src/app/services/common/models/department.service';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-department-add',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './department-add.component.html',
  styleUrls: ['./department-add.component.scss','../../../../../styles.scss']
})
export class DepartmentAddComponent extends BaseComponent implements OnInit {

  @Output() createdDepartment : EventEmitter<CreateDepartment>= new EventEmitter();

  constructor(spinner: NgxSpinnerService, private depatmentService: DepartmentService, private toastr: ToastrService) {
    super(spinner);
   }


  ngOnInit(): void {
    
  }

  addDepartment(depatmentName: HTMLInputElement){
    const create_depratment : CreateDepartment = new CreateDepartment();
    create_depratment.name = depatmentName.value;

    this.showSpinner(SpinnerType.BallSpinClockwise);
    this.depatmentService.add(create_depratment, () => {
      this.hideSpinner(SpinnerType.BallSpinClockwise);
      this.toastr.success("Depatman başarıyla eklendi.");
      
      this.createdDepartment.emit(create_depratment);
    }
    , (errorMessage: string) => {
      this.toastr.error("Departman eklenemedi");
      
    });

    
    setTimeout(() => {
      location.reload();
    }, 1500);
  }

}