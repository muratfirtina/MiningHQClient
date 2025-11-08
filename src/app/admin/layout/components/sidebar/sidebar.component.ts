// sidebar.component.ts - Modern collapsable sidebar
import { Component, ViewChild, OnInit, HostListener, Input } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { filter } from 'rxjs/operators';
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
import { LeaveTypeAddComponent } from 'src/app/admin/components/leave-types/leave-type-add/leave-type-add.component';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
    standalone: true,
    imports: [NgFor, NgIf, RouterLink, RouterLinkActive, JobAddComponent, MachineAddComponent,
      MachineTypeAddComponent, ModelAddComponent, BrandAddComponent, QuarryAddComponent,
      DepartmentAddComponent, LeaveTypeAddComponent]
})
export class SidebarComponent implements OnInit {
  @Input() isCollapsed: boolean = false;
  @ViewChild(JobListComponent) listComponents: JobListComponent;

  // Mobile sidebar control
  isMobileSidebarOpen: boolean = false;

  constructor(
    private dynamicLoadComponentService: DynamicLoadComponentService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Component yüklendiğinde yapılacak işlemler
    this.initializeSidebar();

    // Router events'i dinle
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.setActiveMenuByRoute();
      });
  }
  
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
    { name: 'İzin Türleri', isCollapsed: true }
  ];

  /**
   * Menü açma/kapama işlemi
   * Bir menü açıldığında diğerleri otomatik kapanır
   */
  toggleCollapse(item: { name: string, isCollapsed: boolean }): void {
    // Önce tüm diğer menüleri kapat
    this.items.forEach(menuItem => {
      if (menuItem !== item) {
        menuItem.isCollapsed = true;
      }
    });
    
    // Seçilen menüyü aç/kapat
    item.isCollapsed = !item.isCollapsed;
    
    // Animasyon için kısa bir gecikme
    setTimeout(() => {
      this.updateMenuState(item);
    }, 50);
  }

  /**
   * Mobil sidebar'ı aç/kapat
   */
  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
    
    // Body scroll'unu kontrol et
    if (this.isMobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('sidebar-open');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('sidebar-open');
    }
  }

  /**
   * Mobil sidebar'ı kapat
   */
  closeMobileSidebar(): void {
    this.isMobileSidebarOpen = false;
    document.body.style.overflow = '';
    document.body.classList.remove('sidebar-open');
  }

  /**
   * Submenu link tıklandığında (mobilde sidebar'ı kapat)
   */
  onSubmenuClick(): void {
    if (this.isMobile()) {
      this.closeMobileSidebar();
    }
  }

  /**
   * Window resize listener - mobil sidebar'ı büyük ekranlarda otomatik kapat
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    if (event.target.innerWidth >= 768 && this.isMobileSidebarOpen) {
      this.closeMobileSidebar();
    }
  }

  /**
   * Escape tuşu ile sidebar'ı kapat
   */
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.isMobileSidebarOpen) {
      this.closeMobileSidebar();
    }
  }

  /**
   * Menü durumunu güncelle
   */
  private updateMenuState(item: { name: string, isCollapsed: boolean }): void {
    const menuButton = document.querySelector(`[aria-expanded="${!item.isCollapsed}"]`);
    if (menuButton) {
      if (item.isCollapsed) {
        menuButton.classList.remove('active');
      } else {
        menuButton.classList.add('active');
      }
    }
  }

  /**
   * Sidebar'ı başlat
   */
  private initializeSidebar(): void {
    // Sayfa yüklendiğinde tüm menülerin kapalı olduğundan emin ol
    this.items.forEach(item => {
      item.isCollapsed = true;
    });
    
    // Mevcut route'a göre aktif menüyü belirle
    this.setActiveMenuByRoute();
    
    // Mobil sidebar'ın kapalı olduğundan emin ol
    this.isMobileSidebarOpen = false;
  }

  /**
   * Mevcut route'a göre aktif menüyü belirle
   */
  private setActiveMenuByRoute(): void {
    const currentUrl = window.location.pathname;
    
    // Route'a göre hangi menünün açılacağını belirle
    if (currentUrl.includes('/users')) {
      this.openMenuByName('Yetkili Kullanıcılar');
    } else if (currentUrl.includes('/dashboard')) {
      this.openMenuByName('Gösterge Paneli');
    } else if (currentUrl.includes('/employees')) {
      this.openMenuByName('Çalışanlar');
    } else if (currentUrl.includes('/machines')) {
      this.openMenuByName('Makinalar');
    } else if (currentUrl.includes('/department')) {
      this.openMenuByName('Departmanlar');
    } else if (currentUrl.includes('/jobs')) {
      this.openMenuByName('Meslekler');
    } else if (currentUrl.includes('/machine-types')) {
      this.openMenuByName('Makina Tipleri');
    } else if (currentUrl.includes('/brands')) {
      this.openMenuByName('Markalar');
    } else if (currentUrl.includes('/models')) {
      this.openMenuByName('Modeller');
    } else if (currentUrl.includes('/quarries')) {
      this.openMenuByName('Ocaklar');
    } else if (currentUrl.includes('/leave-types')) {
      this.openMenuByName('İzin Türleri');
    }
  }

  /**
   * İsme göre menü aç
   */
  private openMenuByName(menuName: string): void {
    const menuItem = this.items.find(item => item.name === menuName);
    if (menuItem) {
      menuItem.isCollapsed = false;
    }
  }

  /**
   * Mobil cihaz kontrolü
   */
  private isMobile(): boolean {
    return window.innerWidth <= 768;
  }

  /**
   * Modal açma işlemi (opsiyonel - eğer manuel modal kontrolü gerekirse)
   */
  openModal(modalId: string): void {
    try {
      // Bootstrap modal instance'ı oluştur ve aç
      const modalElement = document.getElementById(modalId);
      if (modalElement && (window as any).bootstrap) {
        const modal = new (window as any).bootstrap.Modal(modalElement);
        modal.show();
        
        // Mobilde modal açılınca sidebar'ı kapat
        if (this.isMobile()) {
          this.closeMobileSidebar();
        }
      }
    } catch (error) {
      console.warn('Modal açılırken hata oluştu:', error);
    }
  }

  /**
   * Menü durumunu sıfırla
   */
  resetMenuState(): void {
    this.items.forEach(item => {
      item.isCollapsed = true;
    });
    this.closeMobileSidebar();
  }

  /**
   * Aktif menü sayısını döndür
   */
  getActiveMenuCount(): number {
    return this.items.filter(item => !item.isCollapsed).length;
  }

  /**
   * Submenu link tıklandığında (mobilde sidebar'ı kapat)
   */


  /**
   * Belirli bir menünün açık olup olmadığını kontrol et
   */
  isMenuOpen(menuName: string): boolean {
    const menuItem = this.items.find(item => item.name === menuName);
    return menuItem ? !menuItem.isCollapsed : false;
  }

  /**
   * Sidebar durumunu kontrol et
   */
  getSidebarState(): { 
    isMobileOpen: boolean, 
    activeMenus: string[], 
    isMobile: boolean 
  } {
    return {
      isMobileOpen: this.isMobileSidebarOpen,
      activeMenus: this.items.filter(item => !item.isCollapsed).map(item => item.name),
      isMobile: this.isMobile()
    };
  }

  /**
   * Component destroy edildiğinde temizlik
   */
  ngOnDestroy(): void {
    // Body scroll'unu geri getir
    document.body.style.overflow = '';
    document.body.classList.remove('sidebar-open');
  }
}