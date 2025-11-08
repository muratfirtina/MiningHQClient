import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { BreadcrumbService } from 'src/app/services/common/breadcrumb.service';
import { AuthService } from 'src/app/services/common/auth.service';
import { Role } from 'src/app/contracts/enums/role.enum';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss', '../../../../styles.scss'],
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        RouterModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatDividerModule,
        BreadcrumbComponent
    ]
})
export class NavbarComponent implements OnInit{

    constructor(
        private breadcrumbService: BreadcrumbService,
        public authService: AuthService
    ) { }

    ngOnInit() {
        this.breadcrumbService.breadcrumbs$.forEach(breadcrumbs => {
            
        });
    }

    getRoleName(): string {
        if (this.authService.isAdmin()) {
            return 'Admin';
        } else if (this.authService.isModerator()) {
            return 'Moderator';
        } else if (this.authService.isHRAssistant()) {
            return 'İK Yardımcısı';
        }
        return 'Kullanıcı';
    }

    onLogout(): void {
        if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
            this.authService.logout();
        }
    }
}
