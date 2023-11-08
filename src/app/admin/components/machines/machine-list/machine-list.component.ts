import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { MachineService } from 'src/app/services/common/models/machine.service';
import { ListMachine} from 'src/app/contracts/machine/list-machine';
import { Machine } from 'src/app/contracts/machine/machine';
import { PageRequest } from 'src/app/contracts/pageRequest';

@Component({
  selector: 'app-machine-list',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './machine-list.component.html',
  styleUrls: ['./machine-list.component.scss','../../../../../styles.scss']
})
export class MachineListComponent extends BaseComponent implements OnInit {
  
  pageRequest: PageRequest = { pageIndex: 0, pageSize: 10 };
  listMachine: ListMachine;
  items: Machine[];
  pagedEmployees: Machine[] = [];
  currentPageNo: number;
  totalItems: number = 0;
  pageSize: number = 10;
  count: number;
  pages: number;
  pageList: number[] = [];

  constructor(
    spinner: NgxSpinnerService,
    private machineService: MachineService,
    private activatedRoute: ActivatedRoute) {
    super(spinner);
  }
  
  async ngOnInit() {
    await this.getMachines();
  }

  async getMachines() {
    this.showSpinner(SpinnerType.BallSpinClockwise);

    this.items = [];
    
    this.activatedRoute.params.subscribe(async (params) => {
      this.currentPageNo = parseInt(params['pageNo'] ?? 1);

      const data: ListMachine = await this.machineService.list(
        this.currentPageNo - 1, // Sayfa indeksi hesaplama
        this.pageSize,
        () => {},
        (errorMessage) => {}
      );
      
      this.listMachine = data;
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
