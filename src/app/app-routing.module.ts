import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './admin/layout/layout.component';
import { DashboardComponent } from './admin/components/dashboard/dashboard.component';
import { HomeComponent } from './ui/components/home/home.component';

const routes: Routes = [
  {
    path:'admin', component:LayoutComponent, children:[
      {path: "", component: DashboardComponent},
      {path:'dashboard',loadComponent:()=>import('./admin/components/dashboard/dashboard.component').then(m=>m.DashboardComponent)},
      {path:'users',loadComponent:()=>import('./admin/components/users/users.component').then(m=>m.UsersComponent)},
      {path:'employees',loadComponent:()=>import('./admin/components/employees/employees.component').then(m=>m.EmployeesComponent)},
      {path:'employees/:pageNo',loadComponent:()=>import('./admin/components/employees/employees.component').then(m=>m.EmployeesComponent)},
      {path:'machines',loadComponent:()=>import('./admin/components/machines/machines.component').then(m=>m.MachinesComponent)},
    ]
  },
  {path:'', component:HomeComponent},
  {path:'employees',loadComponent:()=>import('./ui/components/employees/employees.component').then(m=>m.EmployeesComponent)},
  {path:'machines',loadComponent:()=>import('./ui/components/machines/machines.component').then(m=>m.MachinesComponent)},
  {path:'employee-list',loadComponent:()=>import('./ui/components/employees/employee-list/employee-list.component').then(m=>m.EmployeeListComponent)},
  //{path:'employee-add',loadComponent:()=>import('./ui/components/employees/employee-add/employee-add.component').then(m=>m.EmployeeAddComponent)},
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
