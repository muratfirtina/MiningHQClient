import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { EmployeeService } from 'src/app/services/common/models/employee.service';
import { PageRequest } from 'src/app/contracts/pageRequest';
import { ListEmployee } from 'src/app/contracts/employee/list-employee';
import { Employee } from 'src/app/contracts/employee/employee';
import { Router, RouterModule } from '@angular/router';


@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss','../../../../../styles.scss'],
})
export class EmployeeListComponent extends BaseComponent implements OnInit {
  
  pageRequest: PageRequest = { pageIndex: -1, pageSize: -1 };

  listEmployees: ListEmployee[] = [];
  items: Employee[] = [];

  
  constructor(
    spinner: NgxSpinnerService,
    private employeeService: EmployeeService,
    private router:Router
  ) {
    super(spinner);
  }

  async ngOnInit() {
    await this.getAllEmployees();
  }

  getAllEmployees() {
    this.showSpinner(SpinnerType.BallSpinClockwise);
    this.employeeService.list(this.pageRequest.pageIndex, this.pageRequest.pageSize, () => {}, (errorMessage: string) => {})
      .then((response) => {
    this.items = response.items;
    })
    this.hideSpinner(SpinnerType.BallSpinClockwise);
  }

  goToEmployeePage(id: string) {
    this.router.navigate(['/employee', id]);
  }
}
