import { Injectable, ViewContainerRef } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DynamicLoadComponentService {

  constructor() { }
  
  async loadComponent(component: ComponentName, viewContainerRef: ViewContainerRef) {
    let _component: any = null;
    switch (component) {
      case ComponentName.EmployeeAddComponent:
        _component = (await import('src/app/ui/components/employees/employee-add/employee-add.component')).EmployeeAddComponent;
        break;
      case ComponentName.JobAddComponent:
        _component = (await import('src/app/admin/components/jobs/job-add/job-add.component')).JobAddComponent;
        break;
      case ComponentName.MachineAddComponent:
        _component = (await import('src/app/admin/components/machines/machine-add/machine-add.component')).MachineAddComponent;
        break;
      case ComponentName.MachineTypeAddComponent:
        _component = (await import('src/app/admin/components/machine-types/machine-type-add/machine-type-add.component')).MachineTypeAddComponent;
        break;
      case ComponentName.BrandAddComponent:
        _component = (await import('src/app/admin/components/brands/brand-add/brand-add.component')).BrandAddComponent;
        break;
      case ComponentName.ModelAddComponent:
        _component = (await import('src/app/admin/components/models/model-add/model-add.component')).ModelAddComponent;
        break;
      case ComponentName.QuarryAddComponent:
        _component = (await import('src/app/admin/components/quarries/quarry-add/quarry-add.component')).QuarryAddComponent;
        break;
        
    }
    viewContainerRef.clear();
    return viewContainerRef.createComponent(_component);

  
  }
}


export enum ComponentName {
  EmployeeAddComponent,
  JobAddComponent,
  MachineAddComponent,
  MachineTypeAddComponent,
  BrandAddComponent,
  ModelAddComponent,
  QuarryAddComponent,

}
