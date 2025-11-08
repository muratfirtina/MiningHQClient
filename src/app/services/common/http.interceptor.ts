import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Token'ı al
    const token = this.authService.getToken();
    
    // Eğer token varsa, request'e ekle
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Unauthorized - Token geçersiz veya expired
          this.authService.logout();
          this.toastr.error('Oturumunuz sona erdi. Lütfen tekrar giriş yapın.', 'Oturum Sona Erdi');
          this.router.navigate(['/login']);
        } else if (error.status === 403) {
          // Forbidden - Yetki yok
          this.toastr.error('Bu işlem için yetkiniz bulunmamaktadır.', 'Yetkisiz İşlem');
          this.router.navigate(['/unauthorized']);
        }

        return throwError(() => error);
      })
    );
  }
}
