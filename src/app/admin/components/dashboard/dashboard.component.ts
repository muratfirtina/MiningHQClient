import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent } from 'src/app/base/base.component';
import { EmployeeService } from 'src/app/services/common/models/employee.service';
import { MachineService } from 'src/app/services/common/models/machine.service';
import { QuarryService } from 'src/app/services/common/models/quarry.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    standalone: true,
    imports: [CommonModule, RouterModule]
})
export class DashboardComponent extends BaseComponent implements OnInit {

  employeeCount: number = 0;
  machineCount: number = 0;
  quarryCount: number = 0;

  constructor(
    spinner: NgxSpinnerService,
    private employeeService: EmployeeService,
    private machineService: MachineService,
    private quarryService: QuarryService
  ) {
    super(spinner);
  }

  async ngOnInit(): Promise<void> {
    await this.loadStats();
  }

  async loadStats(): Promise<void> {
    try {
      const employees = await this.employeeService.list(0, 1);
      this.employeeCount = employees.count;

      const machines = await this.machineService.list(0, 1);
      this.machineCount = machines.count;

      const quarries = await this.quarryService.list(0, 1);
      this.quarryCount = quarries.count;
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error);
    }
  }
}
