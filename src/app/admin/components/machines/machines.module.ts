import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MachinesComponent } from './machines.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    MachinesComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {path:'',component:MachinesComponent}
    ])
    
  ]
})
export class MachinesModule { }
