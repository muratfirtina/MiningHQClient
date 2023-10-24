import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersModule } from './users/users.module';
import { MachinesModule } from './machines/machines.module';
import { EmployeesModule } from './employees/employees.module';
import { DashboardModule } from './dashboard/dashboard.module';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    UsersModule,
    MachinesModule,
    EmployeesModule,
    DashboardModule
  ]
})
export class ComponentsModule { }
