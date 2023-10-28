import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
    standalone: true,
    imports: [NgFor, NgIf, RouterLink]
})
export class SidebarComponent {
  
  items: { name: string, isCollapsed: boolean }[] = [
    { name: 'Yetkili Kullanıcılar', isCollapsed: true },
    { name: 'Gösterge Paneli', isCollapsed: true },
    { name: 'Çalışanlar', isCollapsed: true },
    { name: 'Makinalar', isCollapsed: true },
    
  ];


  toggleCollapse(item: { name: string, isCollapsed: boolean }) {
    item.isCollapsed = !item.isCollapsed;
  }
}
