import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { BreadcrumbService } from 'src/app/services/common/breadcrumb.service';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss', '../../../../styles.scss'],
    standalone: true,
    imports: [RouterLink, BreadcrumbComponent,RouterModule]
})
export class NavbarComponent implements OnInit{

    constructor(private breadcrumbService:BreadcrumbService) { }

    ngOnInit() {
        this.breadcrumbService.breadcrumbs$.forEach(breadcrumbs => {
            
        });
    }
}
