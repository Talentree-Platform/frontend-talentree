// src/app/modules/auth/verify-email/verify-email.component.ts

import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService, VerifyEmailData } from '../services/auth.service';
import { StorageService } from '../services/storage.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule]
})
// src/app/modules/auth/verify-email/verify-email.component.ts

export class VerifyEmailComponent implements OnInit {
  // States
  isLoading = false;
  isVerified = false;
  verifyLoading = false;
  sendCodeLoading = false;
  
  // Data
  email = '';
  emailInput = '';  // For the email input field
  verificationCode = '';
  
  // Errors
  codeError = '';
  emailError = '';
  errorMessage = '';
  
  // Resend
  resendSuccess = false;
  resendLoading = false;
  countdown = 60;
  canResend = true;
  
  private isBrowser: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private storageService: StorageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      console.log('🔍 Query params:', params);
      
      // Check if email is in URL
      if (params['email']) {
        this.email = params['email'];
        this.emailInput = params['email'];
        if (this.isBrowser) {
          this.storageService.setItem('pending_verification_email', this.email, { prefix: '' });
        }
      } else if (this.isBrowser) {
        // Try to get from storage
        this.email = this.storageService.getItem('pending_verification_email', { prefix: '' }) || '';
        this.emailInput = this.email;
      }
      
      // Check for token in URL
      const token = params['token'] || params['code'] || params['otpCode'];
      if (token) {
        this.verificationCode = token;
        this.submitVerificationCode();
      }
      
      this.isLoading = false;
    });
  }

  // ✅ Request verification code for the first time
  requestVerificationCode(): void {
    if (!this.emailInput) {
      this.emailError = 'Please enter your email address';
      return;
    }

    if (!this.isValidEmail(this.emailInput)) {
      this.emailError = 'Please enter a valid email address';
      return;
    }

    this.sendCodeLoading = true;
    this.emailError = '';
    this.errorMessage = '';

    this.email = this.emailInput;
    
    // Save email to storage
    if (this.isBrowser) {
      this.storageService.setItem('pending_verification_email', this.email, { prefix: '' });
    }

    this.authService.resendVerificationCode(this.email).subscribe({
      next: (response) => {
        console.log('✅ Verification code sent:', response);
        this.sendCodeLoading = false;
        this.resendSuccess = true;
        this.startCountdown();
      },
      error: (error) => {
        console.error('❌ Failed to send code:', error);
        this.sendCodeLoading = false;
        this.emailError = error.message || 'Failed to send verification code';
      }
    });
  }

  // ✅ Clear email and go back to email input state
  clearEmail(): void {
    this.email = '';
    this.emailInput = '';
    this.verificationCode = '';
    this.codeError = '';
    this.errorMessage = '';
    this.resendSuccess = false;
    
    if (this.isBrowser) {
      this.storageService.removeItem('pending_verification_email', { prefix: '' });
    }
  }

  // src/app/modules/auth/verify-email/verify-email.component.ts

submitVerificationCode(): void {
  if (!this.verificationCode || this.verificationCode.length < 6) {
    this.codeError = 'Please enter a valid 6-digit verification code';
    return;
  }

  if (!this.email) {
    this.codeError = 'Email address is missing';
    return;
  }

  this.verifyLoading = true;
  this.codeError = '';
  this.errorMessage = '';

  console.log('🔐 Verifying email with code:', this.verificationCode);

  const verifyData: VerifyEmailData = {
    email: this.email,
    otpCode: this.verificationCode
  };

  this.authService.verifyEmail(verifyData).subscribe({
    next: (response) => {
      console.log('✅ Email verified successfully!', response);
      this.verifyLoading = false;
      this.isVerified = true;
      
      if (this.isBrowser) {
        this.storageService.removeItem('pending_verification_email', { prefix: '' });
        this.storageService.removeItem('needs_verification', { prefix: '' });
      }
      
      // Show success message
      setTimeout(() => {
        this.goToLogin();
      }, 3000);
    },
    error: (error) => {
      console.error('❌ Verification failed:', error);
      this.verifyLoading = false;
      
      // Even if verification fails, let the user try again
      this.codeError = error.message || 'Invalid verification code. Please try again.';
      this.verificationCode = '';
    }
  });
}

  // ✅ Resend verification code
  resendVerification(): void {
    if (!this.canResend || !this.email) {
      return;
    }

    this.resendLoading = true;
    this.errorMessage = '';
    this.resendSuccess = false;

    this.authService.resendVerificationCode(this.email).subscribe({
      next: (response) => {
        this.resendLoading = false;
        this.resendSuccess = true;
        this.codeError = '';
        
        if (this.isBrowser) {
          this.storageService.setItem('verification_sent_at', Date.now().toString(), { prefix: '' });
        }
        
        this.startCountdown();
      },
      error: (error) => {
        this.resendLoading = false;
        this.errorMessage = error.message || 'Failed to resend verification code';
      }
    });
  }

  // ✅ Helper methods
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  startCountdown(): void {
    this.canResend = false;
    this.countdown = 60;
    
    const interval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(interval);
        this.canResend = true;
      }
    }, 1000);
  }
}