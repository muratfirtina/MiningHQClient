import { Component, EventEmitter, Output, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    standalone: true,
    imports: [CommonModule]
})
export class HeaderComponent implements OnInit {
  @Output() sidebarToggle = new EventEmitter<void>();

  isUserMenuOpen: boolean = false;
  currentUser: any = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  toggleSidebar(): void {
    this.sidebarToggle.emit();
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  loadCurrentUser(): void {
    // LocalStorage'dan kullanıcı bilgilerini al
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        this.currentUser = JSON.parse(userStr);
      } catch (error) {
        console.error('Kullanıcı bilgileri yüklenirken hata:', error);
        this.currentUser = { name: 'Admin', role: 'Yönetici' };
      }
    } else {
      this.currentUser = { name: 'Admin', role: 'Yönetici' };
    }
  }

  navigateToProfile(event: Event): void {
    event.preventDefault();
    this.isUserMenuOpen = false;
    // Profil sayfasına yönlendir
    this.router.navigate(['/admin/profile']);
  }

  navigateToSettings(event: Event): void {
    event.preventDefault();
    this.isUserMenuOpen = false;
    // Ayarlar sayfasına yönlendir
    this.router.navigate(['/admin/settings']);
  }

  logout(event: Event): void {
    event.preventDefault();
    this.isUserMenuOpen = false;

    // Kullanıcı bilgilerini temizle
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    // Login sayfasına yönlendir
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const userMenu = target.closest('.user-menu');

    if (!userMenu && this.isUserMenuOpen) {
      this.isUserMenuOpen = false;
    }
  }
}
