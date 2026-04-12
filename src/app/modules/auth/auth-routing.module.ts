import { RegisterBusinessownerComponent } from './register-businessowner/register-businessowner.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
//import { AuthLandingComponent } from './auth-landing/auth-landing.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import{ ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { AuthComponent } from '../../layout/auth/auth.component';

// import { GoogleLoginComponent } from './google-login/google-login.component';
// import { FacebookLoginComponent } from './facebook-login/facebook-login.component';

const routes: Routes = [
  {
    path: '',component: AuthComponent,
    children: [
     //{ path: '', component: AuthLandingComponent },  // /auth
     // { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },   // /auth/login
      { path: 'register', component: RegisterComponent } ,// /auth/register
      {path:'owner-register', component: RegisterBusinessownerComponent},
      { path: 'verify-email', component: VerifyEmailComponent } ,// /auth/verify-email
      { path: 'forgot-password', component: ForgotPasswordComponent } // /auth/forgot-password
      
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {}
