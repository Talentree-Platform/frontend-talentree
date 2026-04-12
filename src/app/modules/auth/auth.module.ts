import { RegisterBusinessownerComponent } from './register-businessowner/register-businessowner.component';
import { AuthComponent } from './../../layout/auth/auth.component';

import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthRoutingModule } from './auth-routing.module';

// Import standalone components
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';

@NgModule({
  imports: [
    AuthComponent,
    ForgotPasswordComponent,
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AuthRoutingModule,
    // Import standalone components here
    LoginComponent,
    RegisterComponent,
    VerifyEmailComponent,
    RegisterBusinessownerComponent
  ]
})
export class AuthModule { }