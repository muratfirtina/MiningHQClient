import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Role } from 'src/app/contracts/enums/role.enum';

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

  getUserRoles(): Role[] {
    const rolesJson = localStorage.getItem('userRoles');
    if (rolesJson) {
      try {
        return JSON.parse(rolesJson) as Role[];
      } catch (error) {
        console.error('Error parsing user roles:', error);
      }
    }
    return [];
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Token expiration kontrolü yapılabilir
    return true;
  }

  hasRole(role: Role): boolean {
    const userRoles = this.getUserRoles();
    return userRoles && userRoles.length > 0 && userRoles.includes(role);
  }

  hasAnyRole(roles: Role[]): boolean {
    if (!roles || roles.length === 0) return true;
    const userRoles = this.getUserRoles();
    return userRoles && userRoles.length > 0 && roles.some(role => userRoles.includes(role));
  }

  isAdmin(): boolean {
    return this.hasRole(Role.Admin);
  }

  isModerator(): boolean {
    return this.hasRole(Role.Moderator);
  }

  isHRAssistant(): boolean {
    return this.hasRole(Role.HRAssistant);
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
