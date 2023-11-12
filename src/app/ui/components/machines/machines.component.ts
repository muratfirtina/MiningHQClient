import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { DynamicQuery, Filter, Sort } from 'src/app/contracts/dynamic-query';
import { MachineService } from 'src/app/services/common/models/machine.service';
import { ListMachine } from 'src/app/contracts/machine/list-machine';
import { from } from 'rxjs';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-machines',
  templateUrl: './machines.component.html',
  styleUrls: ['./machines.component.scss'],
  standalone: true,
  imports: [NgFor, NgIf,RouterModule, FormsModule,ReactiveFormsModule],
})
export class MachinesComponent extends BaseComponent implements OnInit {
  filter: Filter = {
    field: '',
    operator: '',
    value: ''
  };
  machines: ListMachine; // Bu dizi gerçek makina objelerinizi tutacak.

  constructor(spinner: NgxSpinnerService, private machineService: MachineService) {
    super(spinner);
  }

  ngOnInit(): void {
    this.searchMachines();
  }

  searchMachines(): void {


    this.showSpinner(SpinnerType.BallSpinClockwise);

    const dynamicQuery: DynamicQuery = {
      filter: this.filter,
      // ... diğer DynamicQuery özellikleri
    };

    from(this.machineService.search(dynamicQuery)).subscribe(
      (data: ListMachine) => {
        this.machines = data;
        this.hideSpinner(SpinnerType.BallSpinClockwise);
      },
      (error: any) => {
        console.error('Hata:', error);
        this.hideSpinner(SpinnerType.BallSpinClockwise);
      }
    );
  }
}
