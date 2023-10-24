import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeesModule } from './employees/employees.module';
import { MachinesModule } from './machines/machines.module';
import { HomeModule } from './home/home.module';
import { NavbarModule } from './navbar/navbar.module';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    EmployeesModule,
    MachinesModule,
    HomeModule,
    NavbarModule
  ],
  exports:[
    EmployeesModule,
    MachinesModule,
    HomeModule,
    NavbarModule
  ]
})
export class ComponentsModule { }
