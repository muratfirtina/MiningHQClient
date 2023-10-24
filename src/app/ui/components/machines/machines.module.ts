import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MachinesComponent } from './machines.component';
import { RouterModule } from '@angular/router';
import { NavbarModule } from '../navbar/navbar.module';



@NgModule({
  declarations: [
    MachinesComponent
  ],
  imports: [
    CommonModule,
    NavbarModule,
    RouterModule.forChild([
      {path:'',component:MachinesComponent}
    ])
  ]
})
export class MachinesModule { }
