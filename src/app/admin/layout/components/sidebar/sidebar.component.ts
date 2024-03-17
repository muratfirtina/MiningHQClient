import { Component, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { DynamicLoadComponentDirective } from 'src/app/directives/common/dynamic-load-component.directive';
import { ComponentName, DynamicLoadComponentService } from 'src/app/services/common/dynamic-load-component.service';
import { JobAddComponent } from 'src/app/admin/components/jobs/job-add/job-add.component';
import { JobListComponent } from 'src/app/admin/components/jobs/job-list/job-list.component';
import { MachineAddComponent } from 'src/app/admin/components/machines/machine-add/machine-add.component';
import { MachineTypeAddComponent } from 'src/app/admin/components/machine-types/machine-type-add/machine-type-add.component';
import { ModelAddComponent } from 'src/app/admin/components/models/model-add/model-add.component';
import { BrandAddComponent } from 'src/app/admin/components/brands/brand-add/brand-add.component';
import { QuarryAddComponent } from 'src/app/admin/components/quarries/quarry-add/quarry-add.component';
import { DepartmentAddComponent } from 'src/app/admin/components/department/department-add/department-add.component';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
    standalone: true,
    imports: [NgFor, NgIf, RouterLink,JobAddComponent,MachineAddComponent,
      MachineTypeAddComponent,ModelAddComponent,BrandAddComponent,QuarryAddComponent,DepartmentAddComponent]
})
export class SidebarComponent {

  @ViewChild(JobListComponent)listComponents: JobListComponent;

  constructor(private dynamicLoadComponentService:DynamicLoadComponentService) { }
  
  items: { name: string, isCollapsed: boolean }[] = [
    { name: 'Yetkili Kullanıcılar', isCollapsed: true },
    { name: 'Gösterge Paneli', isCollapsed: true },
    { name: 'Çalışanlar', isCollapsed: true },
    { name: 'Makinalar', isCollapsed: true },
    { name: 'Departmanlar', isCollapsed: true },
    { name: 'Meslekler', isCollapsed: true },
    { name: 'Makina Tipleri', isCollapsed: true },
    { name: 'Markalar', isCollapsed: true },
    { name: 'Modeller', isCollapsed: true },
    { name: 'Ocaklar', isCollapsed: true },
    

    
  ];


  toggleCollapse(item: { name: string, isCollapsed: boolean }) {
    item.isCollapsed = !item.isCollapsed;
  }

}

