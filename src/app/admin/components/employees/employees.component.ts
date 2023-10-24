import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { SingleEmployee } from 'src/app/contracts/employee/single-employee';
import { HttpClientService } from 'src/app/services/common/http-client.service';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent extends BaseComponent implements OnInit {

  constructor(spinner: NgxSpinnerService, private httpClientService:HttpClientService) {
    super(spinner);
   }


  ngOnInit(): void {
    this.showSpinner(SpinnerType.BallSpinClockwise);
    this.getEmployee("7bec4c73-6140-463e-9656-de6246b75d00");
    //this.deleteEmployee("7bec4c73-6140-463e-9656-de6246b75d00");
  } 
 

  employee = new SingleEmployee();

  getEmployee(employeeId:string){
    this.httpClientService.get<SingleEmployee>({controller:"employees"},employeeId).subscribe((response)=>{
      this.employee = response;
    });
  }

  deleteEmployee(employeeId:string){
    this.httpClientService.delete<any>({controller:"employees"},employeeId).subscribe((response)=>{
      console.log(response);
    });
  }

  
} 
