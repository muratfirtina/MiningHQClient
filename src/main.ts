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


bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(BrowserModule, AppRoutingModule,NgxSpinnerModule,NgxPaginationModule, ToastrModule.forRoot(),RouterModule.forRoot([],{bindToComponentInputs:true}),DynamicLoadComponentDirective),
        { provide: "baseUrl", useValue: "http://localhost:5278/api", multi: true },
        provideAnimations(),
        provideHttpClient(withInterceptorsFromDi())
    ]
})
  .catch(err => console.error(err));
