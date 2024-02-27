import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { EmployeeService } from 'src/app/services/common/models/employee.service';
import { PageRequest } from 'src/app/contracts/pageRequest';
import { ListEmployee } from 'src/app/contracts/employee/list-employee';
import { Employee } from 'src/app/contracts/employee/employee';
import { Router, RouterModule } from '@angular/router';
import { SingleEmployee } from 'src/app/contracts/employee/single-employee';
import { FormsModule } from '@angular/forms';
import { GetListResponse } from 'src/app/contracts/getListResponse';


@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule,RouterModule,FormsModule],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss','../../../../../styles.scss'],
})
export class EmployeeListComponent extends BaseComponent implements OnInit {
  
  pageRequest: PageRequest = { pageIndex: -1, pageSize: -1 };

  listEmployees: GetListResponse<SingleEmployee>[] = [];
  items: SingleEmployee[] = [];
  originalItems: SingleEmployee[] = [];

  
  constructor(
    spinner: NgxSpinnerService,
    private employeeService: EmployeeService,
    private router:Router
  ) {
    super(spinner);
  }

  async ngOnInit() {
    await this.getAllEmployees();
    this.originalItems = [...this.items]; 
  }

  async getAllEmployees() {
    this.showSpinner(SpinnerType.BallSpinClockwise);
    await this.employeeService.list(this.pageRequest.pageIndex, this.pageRequest.pageSize, () => {}, (errorMessage: string) => {})
      .then((response) => {
    this.items = response.items;
    this.originalItems = [...this.items];
    })
    this.hideSpinner(SpinnerType.BallSpinClockwise);
  }

  goToEmployeePage(id: string) {
    this.router.navigate(['personeller/personel-listesi/personel', id]);
  }

  searchEmployees(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
  
    if (!searchTerm) {
      this.items = [...this.originalItems];
    } else {
      this.items = this.originalItems.filter(employee =>
        employee.firstName?.toLocaleLowerCase().includes(searchTerm) ||
        employee.lastName?.toLocaleLowerCase().includes(searchTerm) ||
        employee.jobName?.toLocaleLowerCase().includes(searchTerm) ||
        employee.quarryName?.toLocaleLowerCase().includes(searchTerm) ||
        employee.address?.toLocaleLowerCase().includes(searchTerm) ||
        employee.emergencyContact?.toLocaleLowerCase().includes(searchTerm) ||
        employee.hireDate?.toString().toLocaleLowerCase().includes(searchTerm) ||
        employee.departureDate?.toString().toLocaleLowerCase().includes(searchTerm) ||
        employee.birthDate?.toString().toLocaleLowerCase().includes(searchTerm) ||
        employee.licenseType?.toLocaleLowerCase().includes(searchTerm) ||
        employee.phone?.toLocaleLowerCase().includes(searchTerm) ||
        employee.typeOfBlood?.toString().toLocaleLowerCase().includes(searchTerm)||
        employee.id.toString().toLocaleLowerCase() === searchTerm
      );
    }
  }


}
