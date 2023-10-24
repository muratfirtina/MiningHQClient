import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './admin/layout/layout.component';
import { DashboardComponent } from './admin/components/dashboard/dashboard.component';
import { HomeComponent } from './ui/components/home/home.component';

const routes: Routes = [
  {
    path:'admin', component:LayoutComponent, children:[
      {path: "", component: DashboardComponent},
      {path:'dashboard',loadChildren:()=>import('./admin/components/dashboard/dashboard.module').then(m=>m.DashboardModule)},
      {path:'users',loadChildren:()=>import('./admin/components/users/users.module').then(m=>m.UsersModule)},
      {path:'employees',loadChildren:()=>import('./admin/components/employees/employees.module').then(m=>m.EmployeesModule)},
      {path:'machines',loadChildren:()=>import('./admin/components/machines/machines.module').then(m=>m.MachinesModule)},
    ]
  },
  {path:'', component:HomeComponent},
  {path:'employees',loadChildren:()=>import('./ui/components/employees/employees.module').then(m=>m.EmployeesModule)},
  {path:'machines',loadChildren:()=>import('./ui/components/machines/machines.module').then(m=>m.MachinesModule)},
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
