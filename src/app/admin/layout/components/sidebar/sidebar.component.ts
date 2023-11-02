import { Component, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { DynamicLoadComponentDirective } from 'src/app/directives/common/dynamic-load-component.directive';
import { ComponentName, DynamicLoadComponentService } from 'src/app/services/common/dynamic-load-component.service';
import { JobAddComponent } from 'src/app/admin/components/jobs/job-add/job-add.component';
import { JobListComponent } from 'src/app/admin/components/jobs/job-list/job-list.component';
import { CreateJob } from 'src/app/contracts/job/create-job';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
    standalone: true,
    imports: [NgFor, NgIf, RouterLink, DynamicLoadComponentDirective,JobAddComponent]
})
export class SidebarComponent {

  @ViewChild(DynamicLoadComponentDirective, { static: true })
  dynamicLoadComponentDirective!: DynamicLoadComponentDirective;

  @ViewChild(JobListComponent)listComponents: JobListComponent;

  constructor(private dynamicLoadComponentService:DynamicLoadComponentService) { }
  
  items: { name: string, isCollapsed: boolean }[] = [
    { name: 'Yetkili Kullanıcılar', isCollapsed: true },
    { name: 'Gösterge Paneli', isCollapsed: true },
    { name: 'Çalışanlar', isCollapsed: true },
    { name: 'Makinalar', isCollapsed: true },
    { name: 'Meslekler', isCollapsed: true },
    
  ];


  toggleCollapse(item: { name: string, isCollapsed: boolean }) {
    item.isCollapsed = !item.isCollapsed;
  }

  loadComponent() {
    this.dynamicLoadComponentService.loadComponent(ComponentName.JobAddComponent, this.dynamicLoadComponentDirective.viewContainerRef);
  }

  
}

