// src/app/modules/auth/login/login.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';
import { SocialAuthService } from '../services/social-auth.service';
import { GoogleLoginComponent } from '../google-login/google-login.component';
import { FacebookLoginComponent } from '../facebook-login/facebook-login.component';
import { SocialUser } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, GoogleLoginComponent, FacebookLoginComponent]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showVerifyButton = false;
  pendingEmail = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private socialAuthService: SocialAuthService,
    private storageService: StorageService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false]
    });

    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    this.storageService.setItem('returnUrl', returnUrl, { prefix: 'auth_' });
  }

  // =============== 📝 FORM SUBMISSION ===============

  onSubmit(): void {
    this.markFormGroupTouched(this.loginForm);

    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.showVerifyButton = false;

    this.pendingEmail = this.loginForm.value.email;

    const credentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Login successful! Redirecting...';
        this.loginForm.patchValue({ password: '' });
        this.storageService.removeItem('pending_verification_email', { prefix: '' });
      },
      error: (error) => {
        this.isLoading = false;
        this.loginForm.patchValue({ password: '' });

        console.log('🔍 Login error details:', error);

        if (error.status === 500 || error.status === 403) {
          this.errorMessage = 'Your email is not verified. Please verify your email before logging in.';
          this.showVerifyButton = true;

          if (this.pendingEmail) {
            this.storageService.setItem('pending_verification_email', this.pendingEmail, { prefix: '' });
          }
        }
        else if (error.status === 401) {
          this.errorMessage = 'Invalid email or password';
          this.showVerifyButton = false;
        }
        else {
          this.errorMessage = error.error?.message || 'Login failed. Please try again.';
          this.showVerifyButton = false;
        }
      }
    });
  }

  // =============== 📧 VERIFICATION METHODS ===============

  goToVerifyEmail(): void {
    const email = this.pendingEmail || this.loginForm.value.email;

    if (email) {
      this.storageService.setItem('pending_verification_email', email, { prefix: '' });
      console.log('🚀 Navigating to verify-email with email:', email);

      this.router.navigate(['/auth/verify-email'], {
        queryParams: { email: email, from: 'login' }
      }).then(success => {
        if (!success) {
          window.location.href = `/auth/verify-email?email=${encodeURIComponent(email)}`;
        }
      });
    } else {
      this.router.navigate(['/auth/verify-email']);
    }
  }

  resendVerification(): void {
    const email = this.pendingEmail || this.loginForm.value.email;

    if (!email) {
      this.errorMessage = 'Please enter your email address';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.resendVerificationCode(email).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Verification email sent! Please check your inbox.';
        this.storageService.setItem('pending_verification_email', email, { prefix: '' });

        setTimeout(() => {
          this.goToVerifyEmail();
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Failed to send verification email';
      }
    });
  }

  // =============== 🌐 SOCIAL LOGIN METHODS ===============

  googleLogin(): void {
    console.log('🟢 Google login clicked');
  }

  facebookLogin(): void {
    console.log('🔵 Facebook login clicked');
  }

// =============== 🌐 SOCIAL LOGIN METHODS ===============

onGoogleSuccess(response: any): void {
  console.log('✅ Google login success from component', response);
  this.isLoading = false;
  this.successMessage = 'Login successful! Redirecting...';
  
  const returnUrl = this.storageService.getItem('returnUrl', { prefix: 'auth_' }) || '/dashboard';
  setTimeout(() => {
    this.router.navigateByUrl(returnUrl);
  }, 1500);
}

onGoogleError(error: any): void {
  console.error('❌ Google login error', error);
  this.isLoading = false;
  this.errorMessage = error?.message || 'Google login failed. Please try again.';
}

onFacebookSuccess(response: any): void {
  console.log('✅ Facebook login success from component', response);
  this.isLoading = false;
  this.successMessage = 'Login successful! Redirecting...';
  
  const returnUrl = this.storageService.getItem('returnUrl', { prefix: 'auth_' }) || '/dashboard';
  setTimeout(() => {
    this.router.navigateByUrl(returnUrl);
  }, 1500);
}

onFacebookError(error: any): void {
  console.error('❌ Facebook login error', error);
  this.isLoading = false;
  this.errorMessage = error?.message || 'Facebook login failed. Please try again.';
}

  // =============== 🔧 HELPER METHODS ===============

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;
    if (errors['required']) return 'This field is required';
    if (errors['email']) return 'Please enter a valid email address';
    if (errors['minlength']) return 'Password must be at least 8 characters';
    return '';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  goToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  goToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isFieldValid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.valid && (field.dirty || field.touched));
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}