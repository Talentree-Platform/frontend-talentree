// src/app/modules/auth/forgot-password/forgot-password.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, ForgotPasswordData, ResetPasswordData } from '../services/auth.service';
import { StorageService } from '../services/storage.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule]
})
export class ForgotPasswordComponent implements OnInit {
  // Forms
  forgotForm: FormGroup;
  resetForm: FormGroup;
  
  // States
  isLoading = false;
  resetLoading = false;
  isResetMode = false;
  showPassword = false;
  showConfirmPassword = false;
  
  // Data
  email = '';
  resetToken = '';
  otpCode = '';
  
  // Messages
  errorMessage = '';
  successMessage = '';
  
  // OTP Resend
  resendCooldown = 60;
  canResend = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private storageService: StorageService
  ) {
    // Forgot password form
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    // Reset password form
    this.resetForm = this.fb.group({
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordComplexityValidator
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Check if we have email in storage
    const storedEmail = this.storageService.getItem('reset_email', { prefix: '' });
    if (storedEmail) {
      this.email = storedEmail;
      this.forgotForm.patchValue({ email: this.email });
    }
  }

  // =============== STEP 1: FORGOT PASSWORD ===============

  onSubmitForgotPassword(): void {  // ✅ Matches template
    if (this.forgotForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.email = this.forgotForm.value.email;
    this.storageService.setItem('reset_email', this.email, { prefix: '' });

    const forgotData: ForgotPasswordData = {
      email: this.email
    };

    console.log('📧 Requesting password reset for:', this.email);

    this.authService.forgotPassword(forgotData).subscribe({
      next: (response: any) => {  // ✅ Use 'any' type to access token/otpCode
        console.log('✅ Forgot password success:', response);
        this.isLoading = false;
        this.successMessage = 'Password reset code has been sent to your email.';
        this.isResetMode = true;
        
        // ✅ Check if API returns token or otpCode
        if (response.token) {
          this.resetToken = response.token;
        }
        if (response.otpCode) {
          this.otpCode = response.otpCode;
        }
        if (response.code) {
          this.otpCode = response.code;
        }
      },
      error: (error) => {
        console.error('❌ Forgot password error:', error);
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to send reset code. Please try again.';
      }
    });
  }

  // ✅ Add this method
  goBackToForgot(): void {
    this.isResetMode = false;
    this.errorMessage = '';
    this.successMessage = '';
  }

  // ✅ Add this method
  resendOTP(): void {
    if (!this.canResend) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    
    this.authService.forgotPassword({ email: this.email }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.successMessage = 'New verification code sent to your email.';
        this.startResendCooldown();
        
        if (response.otpCode) {
          this.otpCode = response.otpCode;
        }
        if (response.code) {
          this.otpCode = response.code;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to resend code.';
      }
    });
  }

  // ✅ Add cooldown method
  private startResendCooldown(): void {
    this.canResend = false;
    this.resendCooldown = 60;
    
    const interval = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        clearInterval(interval);
        this.canResend = true;
      }
    }, 1000);
  }

  // =============== STEP 2: RESET PASSWORD ===============

  onSubmitResetPassword(): void {  // ✅ This should match your template
    if (this.resetForm.invalid) {
      return;
    }

    this.resetLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const resetData: ResetPasswordData = {
      email: this.email,
      token: this.resetToken,
      otpCode: this.otpCode,
      newPassword: this.resetForm.value.newPassword,
      confirmPassword: this.resetForm.value.confirmPassword
    };

    console.log('📤 Sending reset password request...', resetData);

    this.authService.resetPassword(resetData).subscribe({
      next: (response) => {
        console.log('✅ Reset password success:', response);
        this.resetLoading = false;
        this.successMessage = 'Password reset successfully! Please login with your new password.';
        this.storageService.removeItem('reset_email', { prefix: '' });
        this.resetForm.reset();
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (error) => {
        console.error('❌ Reset password error:', error);
        this.resetLoading = false;
        
        if (error.error?.errors) {
          const firstError = Object.values(error.error.errors)[0] as string[];
          this.errorMessage = firstError[0];
        } else {
          this.errorMessage = error.error?.message || 'Failed to reset password. Please try again.';
        }
      }
    });
  }

  // =============== PASSWORD VALIDATORS ===============

  private passwordComplexityValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value || '';
    
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
    const hasMinLength = value.length >= 8;
    
    const valid = hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && hasMinLength;
    
    return valid ? null : { complexity: true };
  }

  private passwordMatchValidator(form: FormGroup): ValidationErrors | null {
    const password = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  // ✅ Add this method - returns password requirements status
  getPasswordRequirements(): any {
    const password = this.resetForm.get('newPassword')?.value || '';
    
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
  }

  // ✅ Add this method - checks if password is valid
  isPasswordValid(): boolean {
    const requirements = this.getPasswordRequirements();
    return requirements.length && 
           requirements.uppercase && 
           requirements.lowercase && 
           requirements.number && 
           requirements.special;
  }

  // =============== UI HELPERS ===============

  togglePasswordVisibility(field: string): void {
    if (field === 'newPassword') {
      this.showPassword = !this.showPassword;
    } else if (field === 'confirmPassword') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (!field || !field.errors) return '';
    
    const errors = field.errors;
    
    if (errors['required']) return 'This field is required';
    if (errors['email']) return 'Please enter a valid email address';
    if (errors['minlength']) return 'Password must be at least 8 characters';
    
    return '';
  }

  getFormError(): string {
    const errors = this.resetForm.errors;
    if (errors && errors['passwordMismatch']) {
      return 'Passwords do not match';
    }
    return '';
  }
}