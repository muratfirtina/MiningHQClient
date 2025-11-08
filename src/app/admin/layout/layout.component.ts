import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss'],
    standalone: true,
    imports: [HeaderComponent, SidebarComponent, RouterOutlet, CommonModule]
})
export class LayoutComponent {
  isSidebarCollapsed: boolean = false;

  onSidebarToggle(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}
