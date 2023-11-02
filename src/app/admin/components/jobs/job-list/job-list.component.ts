import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { PageRequest } from 'src/app/contracts/pageRequest';
import { ListJob } from 'src/app/contracts/job/list-job';
import { Job } from 'src/app/contracts/job/job';
import { JobService } from 'src/app/services/common/models/job.service';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.scss']
})
export class JobListComponent extends BaseComponent implements OnInit {
  
  pageRequest: PageRequest = { pageIndex: 0, pageSize: 10 };
  listJob: ListJob;
  items: Job[];
  pagedEmployees: Job[] = [];
  currentPageNo: number;
  totalItems: number = 0;
  pageSize: number = 10;
  count: number;
  pages: number;
  pageList: number[] = [];

  constructor(
    spinner: NgxSpinnerService,
    private jobService: JobService,
    private activatedRoute: ActivatedRoute) {
    super(spinner);
  }
  
  async ngOnInit() {
    await this.getJobs();
  }

  async getJobs() {
    this.showSpinner(SpinnerType.BallSpinClockwise);

    this.items = [];
    
    this.activatedRoute.params.subscribe(async (params) => {
      this.currentPageNo = parseInt(params['pageNo'] ?? 1);

      const data: ListJob = await this.jobService.list(
        this.currentPageNo - 1, // Sayfa indeksi hesaplama
        this.pageSize,
        () => {},
        (errorMessage) => {}
      );
      
      this.listJob = data;
      this.items = data.items;

      this.count = data.count;
      this.pages = Math.ceil(this.count / this.pageSize);

      this.pageList = [];
      if (this.pages >= 7) {
        if (this.currentPageNo - 3 <= 0) {
          for (let i = 1; i <= 7; i++) {
            this.pageList.push(i);
          }
        } else if (this.currentPageNo + 3 > this.pages) {
          for (let i = this.pages - 6; i <= this.pages; i++) {
            this.pageList.push(i);
          }
        } else {
          for (let i = this.currentPageNo - 3; i <= this.currentPageNo + 3; i++) {
            this.pageList.push(i);
          }
        }
      } else {
        for (let i = 1; i <= this.pages; i++) {
          this.pageList.push(i);
        }
      }
    });
    this.hideSpinner(SpinnerType.BallSpinClockwise);

  
  }
}