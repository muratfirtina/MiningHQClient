import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { SystemRoles } from 'src/app/contracts/enums/role.enum';

export interface LoginRequest {
  email: string;
  password: string;
  authenticatorCode?: string;
}

export interface LoginResponse {
  accessToken: {
    token: string;
    expiration: Date;
  };
  refreshToken?: {
    token: string;
    expiration: Date;
  };
  requiredAuthenticatorType?: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.currentUserSubject = new BehaviorSubject<any>(this.getToken());
    this.currentUser = this.currentUserSubject.asObservable();
  }

  login(email: string, password: string, authenticatorCode?: string): Observable<LoginResponse> {
    const loginData: LoginRequest = { 
      email, 
      password 
    };
    
    if (authenticatorCode) {
      loginData.authenticatorCode = authenticatorCode;
    }

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, loginData).pipe(
      tap(response => {
        if (response.accessToken && response.accessToken.token) {
          this.saveTokens(response);
          this.saveUserRoles(response.roles);
        }
      })
    );
  }

  private saveTokens(response: LoginResponse): void {
    localStorage.setItem('accessToken', response.accessToken.token);
    if (response.refreshToken) {
      localStorage.setItem('refreshToken', response.refreshToken.token);
    }
    this.currentUserSubject.next(response.accessToken.token);
  }

  private saveUserRoles(roles: string[]): void {
    localStorage.setItem('userRoles', JSON.stringify(roles));
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Decode JWT token and extract payload
   * @param token JWT token string
   * @returns Decoded token payload or null
   */
  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decodedPayload = atob(payload);
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Get user roles from JWT token
   * This reads directly from JWT, not localStorage
   * Supports dynamic roles and operation claims from backend
   * @returns Array of role names and operation claims
   */
  getUserRoles(): string[] {
    const token = this.getToken();
    if (!token) {
      return [];
    }

    try {
      const decodedToken = this.decodeToken(token);
      if (!decodedToken) {
        return [];
      }

      // JWT'deki 'role' claim'ini al
      // Backend hem rol isimlerini hem de operation claim'leri buraya ekler
      const roles = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
                 || decodedToken['role'];

      if (!roles) {
        console.warn('No roles found in JWT token');
        return [];
      }

      // Roles can be either a string or an array
      if (Array.isArray(roles)) {
        return roles;
      } else if (typeof roles === 'string') {
        return [roles];
      }

      return [];
    } catch (error) {
      console.error('Error extracting roles from token:', error);
      return [];
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Token expiration kontrolü yapılabilir
    return true;
  }

  /**
   * DEBUG: Get decoded JWT token for inspection
   * Use in browser console: authService.getDecodedToken()
   */
  getDecodedToken(): any {
    const token = this.getToken();
    if (!token) {
      console.log('No token found');
      return null;
    }
    const decoded = this.decodeToken(token);
    console.log('Decoded JWT:', decoded);
    console.log('Roles from JWT:', this.getUserRoles());
    return decoded;
  }

  hasRole(role: string): boolean {
    const userRoles = this.getUserRoles();
    return userRoles && userRoles.length > 0 && userRoles.includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    if (!roles || roles.length === 0) return true;
    const userRoles = this.getUserRoles();
    return userRoles && userRoles.length > 0 && roles.some(role => userRoles.includes(role));
  }

  isAdmin(): boolean {
    return this.hasRole(SystemRoles.Admin);
  }

  isModerator(): boolean {
    return this.hasRole(SystemRoles.Moderator);
  }

  isHRAssistant(): boolean {
    return this.hasRole(SystemRoles.HRAssistant);
  }

  refreshToken(): Observable<LoginResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post<LoginResponse>(`${this.apiUrl}/refresh-token`, { 
      refreshToken 
    }).pipe(
      tap(response => {
        if (response.accessToken) {
          this.saveTokens(response);
          if (response.roles) {
            this.saveUserRoles(response.roles);
          }
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRoles');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }
}
