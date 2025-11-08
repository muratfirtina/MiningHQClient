import { Component } from '@angular/core';
import { NgxSpinnerModule } from 'ngx-spinner';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './ui/components/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

declare var $: any;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true,
    imports: [RouterOutlet, NgxSpinnerModule, NavbarComponent, CommonModule],
})
export class AppComponent {
  title = 'MiningHQClient';
  showNavbar: boolean = true;

  constructor(private router: Router) {
    // Router events dinle ve navbar görünürlüğünü ayarla
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.checkNavbarVisibility(event.url);
      });
  }

  private checkNavbarVisibility(url: string): void {
    // Login veya admin sayfalarında navbar gizle
    this.showNavbar = !url.includes('/login') &&
                      !url.includes('/admin') &&
                      !url.includes('/unauthorized');
  }
}
