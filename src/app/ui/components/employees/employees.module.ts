import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeesComponent } from './employees.component';
import { RouterModule } from '@angular/router';
import { NavbarModule } from '../navbar/navbar.module';



@NgModule({
  declarations: [
    EmployeesComponent
  ],
  imports: [
    CommonModule,
    NavbarModule,
    RouterModule.forChild([
      {path:'',component:EmployeesComponent}
    ])
  ]
})
export class EmployeesModule { }
