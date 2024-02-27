import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject, filter, map } from 'rxjs';
import { Breadcrumb } from 'src/app/contracts/breadcrumb';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  private breadcrumbs = new BehaviorSubject<Breadcrumb[]>([]);
  breadcrumbs$ = this.breadcrumbs.asObservable();

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.buildBreadcrumbs(this.router.url))
    ).subscribe(breadcrumbs => this.breadcrumbs.next(breadcrumbs));
  }

  private buildBreadcrumbs(url: string): Breadcrumb[] {
    const pathSegments = url.split('/');
    const breadcrumbs: Breadcrumb[] = [];

    //anasayfa için breadcrumb oluştur
    breadcrumbs.push({
      label: 'Anasayfa',
      url: '/'
    });
  
    // Ignore empty segments
    pathSegments.forEach((segment, index) => {
      if (segment !== '') {
        //eğer Guid bir ifade varsa gösterme
        if(segment.length === 36){
          return;
        }
        //soru işaretinden sonrasını gösterme
        if(segment.indexOf('?') > -1){
          segment = segment.split('?')[0];
        }
  
        const label = this.getBreadcrumbLabel(segment);
        const path = pathSegments.slice(0, index + 1).join('/');
        breadcrumbs.push({
          label,
          url: path
        });
      }
    });
  
    return breadcrumbs;
  }

  private getBreadcrumbLabel(segment: string): string {
    
    
    
    
    
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  }
}
