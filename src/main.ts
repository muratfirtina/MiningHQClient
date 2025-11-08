import { importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app.component';
import { ToastrModule } from 'ngx-toastr';
import { withInterceptorsFromDi, provideHttpClient } from '@angular/common/http';
import { NgxSpinnerModule } from 'ngx-spinner';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app/app-routing.module';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { DynamicLoadComponentDirective } from './app/directives/common/dynamic-load-component.directive';
import { FormsModule } from '@angular/forms';
import { BloodTypeDisplayPipe } from './app/pipes/bloodTypeDisplay.pipe';
import { UppercaseinputDirective } from './app/directives/common/uppercaseinput.directive';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './app/services/common/http.interceptor';
import { LoginGuard } from './app/guards/login.guard';
import { RoleGuard } from './app/guards/role.guard';
import { AdminGuard } from './app/guards/admin.guard';
import { AuthService } from './app/services/common/auth.service';
import { QuarryModeratorService } from './app/services/common/models/quarry-moderator.service';
import { UnauthorizedComponent } from './app/ui/components/unauthorized/unauthorized.component';
import { ModeratorManagementComponent } from './app/admin/components/moderator-management/moderator-management.component';
import { LoginComponent } from './app/ui/components/login/login.component';


bootstrapApplication(AppComponent, {
    providers: [
    importProvidersFrom(BrowserModule, AppRoutingModule, NgxSpinnerModule, NgxPaginationModule,MatDialogModule ,ToastrModule.forRoot(), RouterModule.forRoot([], { bindToComponentInputs: true }), DynamicLoadComponentDirective, UppercaseinputDirective, FormsModule),
    { provide: "baseUrl", useValue: "http://localhost:5278/api", multi: true },
    // HTTP Interceptor
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    // Guards
    LoginGuard,
    RoleGuard,
    AdminGuard,
    // Services
    AuthService,
    QuarryModeratorService,
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations()
]
})
  .catch(err => console.error(err));
