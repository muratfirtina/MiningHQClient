import { Component } from '@angular/core';
import { NgxSpinnerModule } from 'ngx-spinner';
import { RouterModule, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './ui/components/navbar/navbar.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';

declare var $: any;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true,
    imports: [RouterOutlet, NgxSpinnerModule,NavbarComponent],
})
export class AppComponent {
  title = 'MiningHQClient';
}
