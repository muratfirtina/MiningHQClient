import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { CreateJob } from 'src/app/contracts/job/create-job';
import { JobService } from 'src/app/services/common/models/job.service';
import { ToastrService } from 'ngx-toastr';
import { DepartmentService } from 'src/app/services/common/models/department.service';
import { ListDepartment } from 'src/app/contracts/department/listDepartment';
import { GetListResponse } from 'src/app/contracts/getListResponse';

@Component({
  selector: 'app-job-add',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-add.component.html',
  styleUrls: ['./job-add.component.scss','../../../../../styles.scss']
})
export class JobAddComponent extends BaseComponent implements OnInit {

  @Output() createdJob : EventEmitter<CreateJob>= new EventEmitter();

  departments: GetListResponse<ListDepartment>
  items: ListDepartment[] = [];

  constructor(spinner: NgxSpinnerService, private jobService: JobService, private toastr: ToastrService, private departmentService: DepartmentService) {
    super(spinner);
   }


  async ngOnInit() {
    await this.getDepartments();
    
  }

  addJob(jobName: HTMLInputElement , departmentName: HTMLSelectElement){
    const create_job : CreateJob = new CreateJob();
    //meslek eklenirken departman seçilsin
    create_job.departmentName = departmentName.value;
    create_job.name = jobName.value;
    //departman id yi departman isminden al
    create_job.departmentId = this.getIdFromItems(this.items, departmentName.value);


    this.showSpinner(SpinnerType.BallSpinClockwise);

    //meslek eklenirken departman seçilsin
    this.jobService.add(create_job, () => {
      this.hideSpinner(SpinnerType.BallSpinClockwise);
      this.toastr.success("Meslek başarıyla eklendi.");
      
      this.createdJob.emit(create_job);

      this.getDepartments();
    }
    , (errorMessage: string) => {
      this.toastr.error("Meslek eklenemedi");
      
    });

    
    /* setTimeout(() => {
      location.reload();
    }, 1500); */
  }

  getDepartments(){
    this.departmentService.list(-1,-1,()=>{}
    ,(errorMessage: string) => {
      this.toastr.error("Departmanlar getirilemedi");
    }).then((response: GetListResponse<ListDepartment>) => {
      this.departments = response;
      this.items = response.items;
    });
  }

  private getIdFromItems(items: any[], value: string): string | null {
    const item = items.find(item => item.name === value);
    return item ? item.id : null;
  }
  
}