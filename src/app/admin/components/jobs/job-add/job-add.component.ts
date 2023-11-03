import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { CreateJob } from 'src/app/contracts/job/create-job';
import { JobService } from 'src/app/services/common/models/job.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-job-add',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-add.component.html',
  styleUrls: ['./job-add.component.scss']
})
export class JobAddComponent extends BaseComponent implements OnInit {

  @Output() createdJob : EventEmitter<CreateJob>= new EventEmitter();

  constructor(spinner: NgxSpinnerService, private jobService: JobService, private toastr: ToastrService) {
    super(spinner);
   }


  ngOnInit(): void {
    
  }

  addJob(jobName: HTMLInputElement){
    const create_job : CreateJob = new CreateJob();
    create_job.name = jobName.value;

    this.showSpinner(SpinnerType.BallSpinClockwise);
    this.jobService.add(create_job, () => {
      this.hideSpinner(SpinnerType.BallSpinClockwise);
      this.toastr.success("Meslek başarıyla eklendi.");
      
      this.createdJob.emit(create_job);
    }
    , (errorMessage: string) => {
      this.toastr.error("Meslek eklenemedi");
      
    });

    
    setTimeout(() => {
      location.reload();
    }, 1500);
  }

}