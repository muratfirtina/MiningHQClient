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
      {path:'machines/machine-add',loadComponent:()=>import('./admin/components/machines/machine-add/machine-add.component').then(m=>m.MachineAddComponent)},
      {path:'machines/machine-list',loadComponent:()=>import('./admin/components/machines/machine-list/machine-list.component').then(m=>m.MachineListComponent)},
      {path:'machines/machine-list/:pageNo',loadComponent:()=>import('./admin/components/machines/machine-list/machine-list.component').then(m=>m.MachineListComponent)},
      {path:'quarries',loadComponent:()=>import('./admin/components/quarries/quarries.component').then(m=>m.QuarriesComponent)},
      {path:'quarries/quarry-add',loadComponent:()=>import('./admin/components/quarries/quarry-add/quarry-add.component').then(m=>m.QuarryAddComponent)},
      {path:'quarries/quarry-list',loadComponent:()=>import('./admin/components/quarries/quarry-list/quarry-list.component').then(m=>m.QuarryListComponent)},
      {path:'quarries/quarry-list/:pageNo',loadComponent:()=>import('./admin/components/quarries/quarry-list/quarry-list.component').then(m=>m.QuarryListComponent)},
      {path:'brands',loadComponent:()=>import('./admin/components/brands/brands.component').then(m=>m.BrandsComponent)},
      {path:'brands/brand-add',loadComponent:()=>import('./admin/components/brands/brand-add/brand-add.component').then(m=>m.BrandAddComponent)},
      {path:'brands/brand-list',loadComponent:()=>import('./admin/components/brands/brand-list/brand-list.component').then(m=>m.BrandListComponent)},
      {path:'brands/brand-list/:pageNo',loadComponent:()=>import('./admin/components/brands/brand-list/brand-list.component').then(m=>m.BrandListComponent)},
      {path:'models',loadComponent:()=>import('./admin/components/models/models.component').then(m=>m.ModelsComponent)},
      {path:'models/model-add',loadComponent:()=>import('./admin/components/models/model-add/model-add.component').then(m=>m.ModelAddComponent)},
      {path:'models/model-list',loadComponent:()=>import('./admin/components/models/model-list/model-list.component').then(m=>m.ModelListComponent)},
      {path:'models/model-list/:pageNo',loadComponent:()=>import('./admin/components/models/model-list/model-list.component').then(m=>m.ModelListComponent)},
      {path:'machine-types',loadComponent:()=>import('./admin/components/machine-types/machine-types.component').then(m=>m.MachineTypesComponent)},
      {path:'machine-types/machine-type-add',loadComponent:()=>import('./admin/components/machine-types/machine-type-add/machine-type-add.component').then(m=>m.MachineTypeAddComponent)},
      {path:'machine-types/machine-type-list',loadComponent:()=>import('./admin/components/machine-types/machine-type-list/machine-type-list.component').then(m=>m.MachineTypeListComponent)},
      {path:'machine-types/machine-type-list/:pageNo',loadComponent:()=>import('./admin/components/machine-types/machine-type-list/machine-type-list.component').then(m=>m.MachineTypeListComponent)},
      {path:'jobs',loadComponent:()=>import('./admin/components/jobs/jobs.component').then(m=>m.JobsComponent)},
      {path:'jobs/job-list',loadComponent:()=>import('./admin/components/jobs/job-list/job-list.component').then(m=>m.JobListComponent)},
      {path:'jobs/job-list/:pageNo',loadComponent:()=>import('./admin/components/jobs/job-list/job-list.component').then(m=>m.JobListComponent)},
      {path:'department',loadComponent:()=>import('./admin/components/department/department.component').then(m=>m.DepartmentComponent)},
      {path:'department/department-list',loadComponent:()=>import('./admin/components/department/department-list/department-list.component').then(m=>m.DepartmentListComponent)},
      {path:'department/department-list/:pageNo',loadComponent:()=>import('./admin/components/department/department-list/department-list.component').then(m=>m.DepartmentListComponent)},

      
      
    ]
  },
  {path:'', component:HomeComponent,data:{breadcrumb:'Anasayfa'}},
  {path:'personeller',loadComponent:()=>import('./ui/components/employees/employees.component').then(m=>m.EmployeesComponent),data:{breadcrumb:'Personeller'}},
  {path:'makinalar',loadComponent:()=>import('./ui/components/machines/machines.component').then(m=>m.MachinesComponent),data:{breadcrumb:'Makinalar'}},
  {path:'personeller/personel-listesi',loadComponent:()=>import('./ui/components/employees/employee-list/employee-list.component').then(m=>m.EmployeeListComponent),data:{breadcrumb:'Personel Listesi'}},
  {path:'personeller/personel-listesi/personel/:employeeId',loadComponent:()=>import('./ui/components/employees/employee-page/employee-page.component').then(m=>m.EmployeePageComponent),data:{breadcrumb:'Personel Bilgileri'}},
  {path:'personeller/personel/:employeeId',loadComponent:()=>import('./ui/components/employees/employee-page/employee-page.component').then(m=>m.EmployeePageComponent),data:{breadcrumb:'Personel Bilgileri'}},
  {path:'personeller/personel-ekle',loadComponent:()=>import('./ui/components/employees/employee-add/employee-add.component').then(m=>m.EmployeeAddComponent),data:{breadcrumb:'Personel Ekle'}},
  {path:'personeller/personel/personel-dosyalar/:employeeId',loadComponent:()=>import('./ui/components/employees/employee-files/employee-files.component').then(m=>m.EmployeeFilesComponent),data:{breadcrumb:'Personel Dosyaları'}},
  {path:'makinalar/ara',loadComponent:()=>import('./ui/components/machines/machines.component').then(m=>m.MachinesComponent),data:{breadcrumb:'Makina Arama'}},
  {path:'personeller/puantaj',loadComponent:()=>import('./ui/components/leave/leave.component').then(m=>m.LeaveComponent),data:{breadcrumb:'İzinler'}},
  {path:'personeller/puantaj/izinislemleri',loadComponent:()=>import('./ui/components/leave/entitled-leave/entitled-leave.component').then(m=>m.EntitledLeaveComponent),data:{breadcrumb:'Hak Edilen İzinler'}},
  {path:'personeller/puantaj/izinislemleri/:pageNo',loadComponent:()=>import('./ui/components/leave/entitled-leave/entitled-leave.component').then(m=>m.EntitledLeaveComponent),data:{breadcrumb:'Hak Edilen İzinler :pageNo'}},
  {path:'personeller/puantaj/takvim',loadComponent:()=>import('./ui/components/leave/calender/calender.component').then(m=>m.CalendarComponent),data:{breadcrumb:'İzin Takvimi'}},
  {path:'personeller/puantaj/puantaj-tablosu',loadComponent:()=>import('./ui/components/leave/timekeeping/timekeeping.component').then(m=>m.TimekeepingComponent),data:{breadcrumb:'Puantaj'}},
  {path:'personeller/puantaj/puantaj/:year/:month',loadComponent:()=>import('./ui/components/leave/timekeeping/timekeeping.component').then(m=>m.TimekeepingComponent),data:{breadcrumb:'Puantaj :year :month'}},
  {path:'personeller/puantaj/mesai-takip',loadComponent:()=>import('./ui/components/overtime/overtime.component').then(m=>m.OvertimeComponent),data:{breadcrumb:'Mesailer'}},
  

  
  {path:'personeller/izinler/izinkullanimi',loadComponent:()=>import('./ui/components/leave/leave-usage/leave-usage.component').then(m=>m.LeaveUsageComponent),data:{breadcrumb:'İzin Kullanımı'}},
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
