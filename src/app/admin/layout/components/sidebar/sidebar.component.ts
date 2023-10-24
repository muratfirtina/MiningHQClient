import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  
  items: { name: string, isCollapsed: boolean }[] = [
    { name: 'Kullanıcılar', isCollapsed: true },
    { name: 'Gösterge Paneli', isCollapsed: true },
    { name: 'Çalışanlar', isCollapsed: true },
    { name: 'Makinalar', isCollapsed: true },
    
  ];

  toggleCollapse(item: { name: string, isCollapsed: boolean }) {
    item.isCollapsed = !item.isCollapsed;
  }
}
