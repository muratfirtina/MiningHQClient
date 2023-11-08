import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListMachineType } from 'src/app/contracts/machine-type/list-machine-type';
import { MachineType } from 'src/app/contracts/machine-type/machine-type';
import { MachineTypeService } from 'src/app/services/common/models/machine-type.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { PageRequest } from 'src/app/contracts/pageRequest';

@Component({
  selector: 'app-machine-type-list',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './machine-type-list.component.html',
  styleUrls: ['./machine-type-list.component.scss','../../../../../styles.scss']
})
export class MachineTypeListComponent extends BaseComponent implements OnInit {
  
  pageRequest: PageRequest = { pageIndex: 0, pageSize: 10 };
  listMachineType: ListMachineType;
  items: MachineType[];
  pagedEmployees: MachineType[] = [];
  currentPageNo: number;
  totalItems: number = 0;
  pageSize: number = 10;
  count: number;
  pages: number;
  pageList: number[] = [];

  constructor(
    spinner: NgxSpinnerService,
    private machineTypeService: MachineTypeService,
    private activatedRoute: ActivatedRoute) {
    super(spinner);
  }
  
  async ngOnInit() {
    await this.getMachineTypes();
  }

  async getMachineTypes() {
    this.showSpinner(SpinnerType.BallSpinClockwise);

    this.items = [];
    
    this.activatedRoute.params.subscribe(async (params) => {
      this.currentPageNo = parseInt(params['pageNo'] ?? 1);

      const data: ListMachineType = await this.machineTypeService.list(
        this.currentPageNo - 1, // Sayfa indeksi hesaplama
        this.pageSize,
        () => {},
        (errorMessage) => {}
      );
      
      this.listMachineType = data;
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
