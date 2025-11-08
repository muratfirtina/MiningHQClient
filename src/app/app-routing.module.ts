import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './admin/layout/layout.component';
import { DashboardComponent } from './admin/components/dashboard/dashboard.component';
import { HomeComponent } from './ui/components/home/home.component';
import { UnauthorizedComponent } from './ui/components/unauthorized/unauthorized.component';
import { ModeratorManagementComponent } from './admin/components/moderator-management/moderator-management.component';
import { LoginComponent } from './ui/components/login/login.component';
import { LoginGuard } from './guards/login.guard';
import { AdminGuard } from './guards/admin.guard';
import { RoleGuard } from './guards/role.guard';
import { Role } from './contracts/enums/role.enum';

  
const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'unauthorized',
    component: UnauthorizedComponent
  },
  {
    path:'admin', 
    component:LayoutComponent,
    canActivate: [LoginGuard, AdminGuard],
    children:[
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
      {path:'quarries/:id',loadComponent:()=>import('./admin/components/quarries/quarry-detail/quarry-detail.component').then(m=>m.QuarryDetailComponent)},
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
      {path:'leave-types',loadComponent:()=>import('./admin/components/leave-types/leave-types.component').then(m=>m.LeaveTypesComponent)},
      {path:'leave-types/leave-type-list',loadComponent:()=>import('./admin/components/leave-types/leave-type-list/leave-type-list.component').then(m=>m.LeaveTypeListComponent)},
      {path:'leave-types/leave-type-list/:pageNo',loadComponent:()=>import('./admin/components/leave-types/leave-type-list/leave-type-list.component').then(m=>m.LeaveTypeListComponent)},
      {path:'moderator-management', component: ModeratorManagementComponent}
    ]
  },
  {
    path:'', 
    component:HomeComponent,
    canActivate: [LoginGuard],
    data:{breadcrumb:'Anasayfa'}
  },
  
  // Employee Routes
  {path:'personeller',loadComponent:()=>import('./ui/components/employees/employees.component').then(m=>m.EmployeesComponent),canActivate: [LoginGuard, RoleGuard],data:{breadcrumb:'Personeller', roles: [Role.Admin, Role.Moderator, Role.HRAssistant]}},
  {path:'personeller/personel-listesi',loadComponent:()=>import('./ui/components/employees/employee-list/employee-list.component').then(m=>m.EmployeeListComponent),canActivate: [LoginGuard, RoleGuard],data:{breadcrumb:'Personel Listesi', roles: [Role.Admin, Role.Moderator, Role.HRAssistant]}},
  {path:'personeller/personel-listesi/personel/:employeeId',loadComponent:()=>import('./ui/components/employees/employee-page/employee-page.component').then(m=>m.EmployeePageComponent),canActivate: [LoginGuard, RoleGuard],data:{breadcrumb:'Personel Bilgileri', roles: [Role.Admin, Role.Moderator, Role.HRAssistant]}},
  {path:'personeller/personel/:employeeId',loadComponent:()=>import('./ui/components/employees/employee-page/employee-page.component').then(m=>m.EmployeePageComponent),canActivate: [LoginGuard, RoleGuard],data:{breadcrumb:'Personel Bilgileri', roles: [Role.Admin, Role.Moderator, Role.HRAssistant]}},
  {path:'personeller/personel-ekle',loadComponent:()=>import('./ui/components/employees/employee-add/employee-add.component').then(m=>m.EmployeeAddComponent),canActivate: [LoginGuard, RoleGuard],data:{breadcrumb:'Personel Ekle', roles: [Role.Admin, Role.Moderator, Role.HRAssistant]}},
  {path:'personeller/personel/personel-dosyalar/:employeeId',loadComponent:()=>import('./ui/components/employees/employee-files/employee-files.component').then(m=>m.EmployeeFilesComponent),canActivate: [LoginGuard, RoleGuard],data:{breadcrumb:'Personel Dosyaları', roles: [Role.Admin, Role.Moderator, Role.HRAssistant]}},
  
  // Machine Routes - UI (SPECIFIC ROUTES FIRST!)
  {path:'makinalar',loadComponent:()=>import('./ui/components/machines/machines.component').then(m=>m.MachinesComponent),canActivate: [LoginGuard, RoleGuard],data:{breadcrumb:'Makinalar', roles: [Role.Admin, Role.Moderator]}},
  {path:'makinalar/makina-listesi',loadComponent:()=>import('./ui/components/machines/machine-list/machine-list.component').then(m=>m.MachineListComponent),canActivate: [LoginGuard, RoleGuard],data:{breadcrumb:'Makina Listesi', roles: [Role.Admin, Role.Moderator]}},
  {path:'makinalar/makina-ekle',loadComponent:()=>import('./ui/components/machines/machine-add/machine-add.component').then(m=>m.MachineAddComponent),canActivate: [LoginGuard, RoleGuard],data:{breadcrumb:'Makina Ekle', roles: [Role.Admin, Role.Moderator]}},
  {path:'makinalar/makina-raporlari',loadComponent:()=>import('./ui/components/machines/machine-reports/machine-reports.component').then(m=>m.MachineReportsComponent),canActivate: [LoginGuard, RoleGuard],data:{breadcrumb:'Makina Raporları', roles: [Role.Admin, Role.Moderator]}},
  {path:'makinalar/bakim-takvimi',loadComponent:()=>import('./ui/components/machines/maintenance-schedule/maintenance-schedule.component').then(m=>m.MaintenanceScheduleComponent),canActivate: [LoginGuard, RoleGuard],data:{breadcrumb:'Bakım Takvimi', roles: [Role.Admin, Role.Moderator]}},
  {path:'makinalar/makina-puantaji',loadComponent:()=>import('./ui/components/daily-entry/daily-entry.component').then(m=>m.DailyEntryComponent),canActivate: [LoginGuard, RoleGuard],data:{breadcrumb:'Makina Puantajı', roles: [Role.Admin, Role.Moderator]}},
  {path:'makinalar/ara',loadComponent:()=>import('./ui/components/machines/machines.component').then(m=>m.MachinesComponent),canActivate: [LoginGuard, RoleGuard],data:{breadcrumb:'Makina Arama', roles: [Role.Admin, Role.Moderator]}},

  // Specific machine routes (must come BEFORE general :machineId route)
  {path:'makinalar/makina/:machineId/dosyalar',loadComponent:()=>import('./ui/components/machines/machine-files/machine-files.component').then(m=>m.MachineFilesComponent),canActivate: [LoginGuard, RoleGuard],data:{breadcrumb:'Makina Dosyaları', roles: [Role.Admin, Role.Moderator]}},
  {path:'makinalar/makina/:machineId/bakim-ekle',loadComponent:()=>import('./ui/components/machines/maintenance/maintenance-add/maintenance-add.component').then(m=>m.MaintenanceAddComponent),canActivate: [LoginGuard, RoleGuard],data:{breadcrumb:'Bakım Ekle', roles: [Role.Admin, Role.Moderator]}},
  {path:'makinalar/makina/:machineId/bakim/:maintenanceId',loadComponent:()=>import('./ui/components/machines/maintenance/maintenance-detail/maintenance-detail.component').then(m=>m.MaintenanceDetailComponent),canActivate: [LoginGuard, RoleGuard],data:{breadcrumb:'Bakım Detayı', roles: [Role.Admin, Role.Moderator]}},
  {path:'makinalar/makina/:machineId/bakim',loadComponent:()=>import('./ui/components/machines/maintenance/maintenance-list/maintenance-list.component').then(m=>m.MaintenanceListComponent),canActivate: [LoginGuard, RoleGuard],data:{breadcrumb:'Bakım Geçmişi', roles: [Role.Admin, Role.Moderator]}},
  {path:'makinalar/makina/:machineId/is-verileri',loadComponent:()=>import('./ui/components/machines/machine-page/machine-page.component').then(m=>m.MachinePageComponent),canActivate: [LoginGuard, RoleGuard],data:{breadcrumb:'İş Verileri', roles: [Role.Admin, Role.Moderator]}},
  {path:'makinalar/makina/:machineId/yakit',loadComponent:()=>import('./ui/components/fuel-consumption-report/fuel-consumption-report.component').then(m=>m.FuelConsumptionReportComponent),canActivate: [LoginGuard, RoleGuard],data:{breadcrumb:'Yakıt Tüketimi', roles: [Role.Admin, Role.Moderator]}},
  {path:'makinalar/makina-listesi/makina/:machineId',loadComponent:()=>import('./ui/components/machines/machine-page/machine-page.component').then(m=>m.MachinePageComponent),canActivate: [LoginGuard, RoleGuard],data:{breadcrumb:'Makina Bilgileri', roles: [Role.Admin, Role.Moderator]}},

  // General machine route (MUST come AFTER specific routes)
  {path:'makinalar/makina/:machineId',loadComponent:()=>import('./ui/components/machines/machine-page/machine-page.component').then(m=>m.MachinePageComponent),canActivate: [LoginGuard, RoleGuard],data:{breadcrumb:'Makina Bilgileri', roles: [Role.Admin, Role.Moderator]}},
  
  // Leave and Timeekeeping Routes
  {path:'personeller/puantaj',loadComponent:()=>import('./ui/components/leave/leave.component').then(m=>m.LeaveComponent),canActivate: [LoginGuard, RoleGuard],data:{breadcrumb:'İzinler', roles: [Role.Admin, Role.Moderator, Role.HRAssistant]}},
  {path:'personeller/puantaj/izinislemleri',loadComponent:()=>import('./ui/components/leave/entitled-leave/entitled-leave.component').then(m=>m.EntitledLeaveComponent),canActivate: [LoginGuard, RoleGuard],data:{breadcrumb:'Hak Edilen İzinler', roles: [Role.Admin, Role.Moderator, Role.HRAssistant]}},
  {path:'personeller/puantaj/izinislemleri/:pageNo',loadComponent:()=>import('./ui/components/leave/entitled-leave/entitled-leave.component').then(m=>m.EntitledLeaveComponent),canActivate: [LoginGuard, RoleGuard],data:{breadcrumb:'Hak Edilen İzinler :pageNo', roles: [Role.Admin, Role.Moderator, Role.HRAssistant]}},
  {path:'personeller/puantaj/takvim',loadComponent:()=>import('./ui/components/leave/calender/calender.component').then(m=>m.CalendarComponent),canActivate: [LoginGuard, RoleGuard],data:{breadcrumb:'İzin Takvimi', roles: [Role.Admin, Role.Moderator, Role.HRAssistant]}},
  {path:'personeller/puantaj/puantaj-tablosu',loadComponent:()=>import('./ui/components/leave/timekeeping/timekeeping.component').then(m=>m.TimekeepingComponent),canActivate: [LoginGuard, RoleGuard],data:{breadcrumb:'Puantaj', roles: [Role.Admin, Role.Moderator, Role.HRAssistant]}},
  {path:'personeller/puantaj/puantaj/:year/:month',loadComponent:()=>import('./ui/components/leave/timekeeping/timekeeping.component').then(m=>m.TimekeepingComponent),canActivate: [LoginGuard, RoleGuard],data:{breadcrumb:'Puantaj :year :month', roles: [Role.Admin, Role.Moderator, Role.HRAssistant]}},
  {path:'personeller/puantaj/mesai-takip',loadComponent:()=>import('./ui/components/overtime/overtime.component').then(m=>m.OvertimeComponent),canActivate: [LoginGuard, RoleGuard],data:{breadcrumb:'Mesailer', roles: [Role.Admin, Role.Moderator, Role.HRAssistant]}},

  // Leave Usage Routes
  {path:'personeller/izinler/izinkullanimi',loadComponent:()=>import('./ui/components/leave/leave-usage/leave-usage.component').then(m=>m.LeaveUsageComponent),canActivate: [LoginGuard, RoleGuard],data:{breadcrumb:'İzin Kullanımı', roles: [Role.Admin, Role.Moderator, Role.HRAssistant]}},
  
  // Quarry Routes - UI
  {path:'ocaklar',loadComponent:()=>import('./ui/components/quarries/quarries/quarries.component').then(m=>m.QuarriesComponent),canActivate: [LoginGuard, RoleGuard],data:{breadcrumb:'Ocaklar', roles: [Role.Admin, Role.Moderator]}},
  {path:'ocaklar/ocak-listesi',loadComponent:()=>import('./ui/components/quarries/quarry-list/quarry-list.component').then(m=>m.QuarryListComponent),canActivate: [LoginGuard, RoleGuard],data:{breadcrumb:'Ocak Listesi', roles: [Role.Admin, Role.Moderator]}},
  {path:'ocaklar/ocak-ekle',loadComponent:()=>import('./ui/components/quarries/quarry-add/quarry-add.component').then(m=>m.QuarryAddComponent),canActivate: [LoginGuard, RoleGuard],data:{breadcrumb:'Ocak Ekle', roles: [Role.Admin, Role.Moderator]}},
  {path:'ocaklar/ocak/:quarryId',loadComponent:()=>import('./ui/components/quarries/quarry-page/quarry-page.component').then(m=>m.QuarryPageComponent),canActivate: [LoginGuard, RoleGuard],data:{breadcrumb:'Ocak Bilgileri', roles: [Role.Admin, Role.Moderator]}},
  {path:'ocaklar/uretim/:quarryId',loadComponent:()=>import('./ui/components/quarries/quarry-production/quarry-production.component').then(m=>m.QuarryProductionComponent),canActivate: [LoginGuard, RoleGuard],data:{breadcrumb:'Üretim Verileri', roles: [Role.Admin, Role.Moderator]}},
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
