import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { PageRequest } from 'src/app/contracts/pageRequest';
import { ListQuarry } from 'src/app/contracts/quarry/list-quarry';
import { Quarry } from 'src/app/contracts/quarry/quarry';
import { QuarryService } from 'src/app/services/common/models/quarry.service';

@Component({
  selector: 'app-quarry-list',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './quarry-list.component.html',
  styleUrls: ['./quarry-list.component.scss','../../../../../styles.scss']
})
export class QuarryListComponent extends BaseComponent implements OnInit {
  
  pageRequest: PageRequest = { pageIndex: 0, pageSize: 10 };
  listQuarry: ListQuarry;
  items: Quarry[];
  pagedEmployees: Quarry[] = [];
  currentPageNo: number;
  totalItems: number = 0;
  pageSize: number = 10;
  count: number;
  pages: number;
  pageList: number[] = [];

  constructor(
    spinner: NgxSpinnerService,
    private quarryService: QuarryService,
    private activatedRoute: ActivatedRoute) {
    super(spinner);
  }
  
  async ngOnInit() {
    await this.getQuarries();
  }

  async getQuarries() {
    this.showSpinner(SpinnerType.BallSpinClockwise);

    this.items = [];
    
    this.activatedRoute.params.subscribe(async (params) => {
      this.currentPageNo = parseInt(params['pageNo'] ?? 1);

      const data: ListQuarry = await this.quarryService.list(
        this.currentPageNo - 1, // Sayfa indeksi hesaplama
        this.pageSize,
        () => {},
        (errorMessage) => {}
      );
      
      this.listQuarry = data;
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