import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from 'src/app/services/common/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  hidePassword = true;
  returnUrl: string = '/';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Return URL'i al
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    
    // Eğer kullanıcı zaten login ise, return URL'e yönlendir
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.loading = true;
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (response) => {
        this.loading = false;
        
        if (response.requiredAuthenticatorType) {
          // 2FA gerekiyorsa
          this.toastr.info('İki faktörlü doğrulama kodu gönderildi');
          // Buraya 2FA component'ine yönlendirme eklenebilir
          return;
        }

        // Login başarılı
        this.toastr.success('Giriş başarılı!', 'Hoş Geldiniz');
        
        // Return URL'e veya kullanıcının rolüne göre yönlendirme
        if (this.returnUrl && this.returnUrl !== '/') {
          this.router.navigate([this.returnUrl]);
        } else if (this.authService.isAdmin()) {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Login error:', error);
        
        if (error.status === 400) {
          this.toastr.error('Email veya şifre hatalı', 'Giriş Başarısız');
        } else if (error.status === 404) {
          this.toastr.error('Kullanıcı bulunamadı', 'Giriş Başarısız');
        } else {
          this.toastr.error('Giriş yapılırken bir hata oluştu', 'Hata');
        }
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.loginForm.get(fieldName);
    
    if (control?.hasError('required')) {
      return 'Bu alan zorunludur';
    }
    
    if (control?.hasError('email')) {
      return 'Geçerli bir email adresi giriniz';
    }
    
    if (control?.hasError('minlength')) {
      return 'Şifre en az 6 karakter olmalıdır';
    }
    
    return '';
  }
}
