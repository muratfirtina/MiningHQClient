import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { DynamicLoadComponentDirective } from 'src/app/directives/common/dynamic-load-component.directive';
import { EmployeeService } from 'src/app/services/common/models/employee.service';
import { CreateEmployee } from 'src/app/contracts/employee/create-employee';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { JobService } from 'src/app/services/common/models/job.service';
import { PageRequest } from 'src/app/contracts/pageRequest';
import { ListJob } from 'src/app/contracts/job/list-job';
import { Job } from 'src/app/contracts/job/job';



@Component({
  selector: 'app-employee-add',
  standalone: true,
  imports: [CommonModule,DynamicLoadComponentDirective],
  templateUrl: './employee-add.component.html',
  styleUrls: ['./employee-add.component.scss']
})
export class EmployeeAddComponent extends BaseComponent implements OnInit {

  
  @Output() createdProduct : EventEmitter<CreateEmployee>= new EventEmitter();
  
  pageRequest: PageRequest = { pageIndex: -1, pageSize: -1 };

  listJobs: ListJob[] = [];
  items: Job[] = [];
  filteredJobs: Job[] = [];


  constructor(spinner: NgxSpinnerService,
     private employeeService: EmployeeService,
     private toastr: ToastrService,
     private router: Router,
     private jobService: JobService
       ) {
    super(spinner);
    
  }
  async ngOnInit() {
    await this.getJobs();
  }
  
  saveEmployee(firstName: HTMLInputElement, lastName: HTMLInputElement, jobName:HTMLSelectElement){
    this.showSpinner(SpinnerType.BallSpinClockwise);
    const create_employee : CreateEmployee = new CreateEmployee();
    create_employee.firstName = firstName.value;
    create_employee.lastName = lastName.value;
    create_employee.jobName = jobName.value;
    //job name den job id bulunacak
    for (let index = 0; index < this.items.length; index++) {
      if(this.items[index].name == jobName.value){
        create_employee.jobId = this.items[index].id;
      }
    }



    this.employeeService.add(create_employee, () => {
      this.hideSpinner(SpinnerType.BallSpinClockwise);
      this.toastr.success( create_employee.firstName + create_employee.lastName + " Başarıyla oluşturuldu.", "Başarılı", );
      this.createdProduct.emit(create_employee);

      

    }, errorMessage => {
      this.toastr.error("Personel kaydedilemedi", "Hata");
    });

  }

  getJobs(){
    this.showSpinner(SpinnerType.BallSpinClockwise);
    this.jobService.list(this.pageRequest.pageIndex, this.pageRequest.pageSize, () => {}, (errorMessage: string) => {})
      .then((response) => {
    this.items = response.items;
    
    })
    this.hideSpinner(SpinnerType.BallSpinClockwise);
  }

}

