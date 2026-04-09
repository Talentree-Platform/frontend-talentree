// src/app/modules/auth/services/auth.service.ts

import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { isPlatformBrowser } from '@angular/common';

// =============== 📦 INTERFACES ===============
export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  role: string;
  acceptTerms: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phoneNumber: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface VerifyEmailData {
  email: string;
  otpCode: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  token: string;
  otpCode: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ExternalLoginData {
  provider: 'Google' | 'Facebook';
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public apiUrl = 'https://talentreeplateform.runasp.net/api';
  private isBrowser: boolean;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private storage: StorageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    console.log('🌍 AuthService Platform:', this.isBrowser ? 'Browser' : 'Server');

    if (this.isBrowser) {
      this.loadUserFromStorage();
    }
  }

  // =============== 🔄 INITIALIZATION ===============

  private loadUserFromStorage(): void {
    if (!this.isBrowser) return;

    try {
      const user = this.storage.getObject<User>('user', { prefix: 'auth_' });
      const token = this.storage.getItem('token', { prefix: 'auth_' });

      if (user && token) {
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
        console.log('✅ User loaded from storage:', user.email);
      } else {
        console.log('📭 No user data found in storage');
      }
    } catch (error) {
      console.error('❌ Error loading user from storage:', error);
      this.clearAuthData();
    }
  }

  // =============== ✅ 1. REGISTER ===============

  register(userData: RegisterData): Observable<any> {
    if (!this.isBrowser) {
      return of({});
    }

    if (userData.password !== userData.confirmPassword) {
      return throwError(() => new Error('Passwords do not match'));
    }

    let phoneNumber = userData.phoneNumber;
    if (phoneNumber && !phoneNumber.startsWith('+')) {
      phoneNumber = `+${phoneNumber}`;
    }

    const aspNetData = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
      ConfirmPassword: userData.confirmPassword,
      phoneNumber: phoneNumber,
      role: userData.role,
      acceptTerms: userData.acceptTerms
    };

    console.log('📤 Sending to ASP.NET Core:', JSON.stringify(aspNetData, null, 2));

    return this.http.post<any>(`${this.apiUrl}/Auth/register`, aspNetData)
      .pipe(
        tap((response: any) => {
          console.log('✅ Registration successful', response);
          this.clearAuthData();
          this.setPendingVerification(userData.email);
          
          // Send verification email - backend generates code
          this.sendVerificationEmail(userData.email).subscribe({
            error: (err) => console.warn('Email sending failed:', err)
          });
          
          this.router.navigate(['/auth/verify-email'], {
            queryParams: {
              email: userData.email,
              registered: 'true'
            }
          });
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('❌ Registration failed:', error);
          return throwError(() => error);
        })
      );
  }

  // =============== 📧 2. SEND VERIFICATION EMAIL ===============

  sendVerificationEmail(email: string): Observable<any> {
    console.log('📧 Backend sending verification email to:', email);
    
    // ✅ ONLY call backend - NO fake code generation
    return this.http.post(`${this.apiUrl}/Auth/forgot-password`, { email })
      .pipe(
        tap(() => console.log('✅ Backend sent verification email')),
        catchError((error) => {
          console.error('❌ Backend failed to send email:', error);
          return throwError(() => error);
        })
      );
  }

  // =============== ✅ 3. LOGIN ===============

  login(credentials: LoginData): Observable<LoginResponse> {
    if (!this.isBrowser) {
      return of({} as LoginResponse);
    }

    console.log('🔐 Logging in:', credentials.email);

    return this.http.post<any>(`${this.apiUrl}/Auth/login`, credentials)
      .pipe(
        tap((response: any) => {
          console.log('✅ Login successful');
          const normalizedResponse = this.normalizeLoginResponse(response);
          this.handleAuthSuccess(normalizedResponse);
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('❌ Login failed:', error);
          this.clearAuthData();
          return throwError(() => error);
        })
      );
  }

  // =============== ✅ 4. VERIFY EMAIL ===============
verifyEmail(data: VerifyEmailData): Observable<{ message: string }> {
  console.log('✅ Sending verification code to backend:', data.otpCode);
  
  // ✅ THIS IS WHAT YOUR API EXPECTS - EXACT MATCH!
  const requestBody = {
    email: data.email,
    otpCode: data.otpCode  // Must be EXACTLY 'otpCode'
  };

  console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));

  return this.http.post<{ message: string }>(`https://talentreeplateform.runasp.net/api/Auth/verify-email`, requestBody)
    .pipe(
      tap((response) => {
        console.log('✅ Email verified successfully!', response);
        this.clearVerificationState();
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Verification failed:', error);
        console.error('❌ Status:', error.status);
        console.error('❌ Response:', error.error);
        return throwError(() => error);
      })
    );
}

  // =============== 🔄 5. RESEND VERIFICATION CODE ===============

  resendVerificationCode(email: string): Observable<{ message: string }> {
    console.log('🔄 Backend resending verification code to:', email);
    
    this.setPendingVerification(email);
    
    // ✅ ONLY call backend - NO fake code
    return this.forgotPassword({ email }).pipe(
      map((response) => ({ 
        message: response.message || 'Verification code sent to your email' 
      })),
      catchError((error) => {
        console.error('❌ Backend failed to resend code:', error);
        return throwError(() => error);
      })
    );
  }

  // =============== 🔐 6. FORGOT PASSWORD ===============

  forgotPassword(data: ForgotPasswordData): Observable<{ message: string }> {
    if (!this.isBrowser) {
      return of({ message: 'Reset code sent' });
    }

    console.log('📧 Forgot password for:', data.email);

    return this.http.post<{ message: string }>(`${this.apiUrl}/Auth/forgot-password`, { email: data.email })
      .pipe(
        tap(response => console.log('✅ Forgot password success:', response)),
        catchError((error) => {
          console.error('❌ Forgot password failed:', error);
          return throwError(() => error);
        })
      );
  }

  // =============== 🔑 7. RESET PASSWORD ===============

  resetPassword(data: ResetPasswordData): Observable<{ message: string }> {
    if (!this.isBrowser) {
      return of({ message: 'Password reset successful' });
    }

    console.log('🔄 Resetting password for:', data.email);

    return this.http.post<{ message: string }>(`${this.apiUrl}/Auth/reset-password`, data)
      .pipe(
        tap(response => console.log('✅ Password reset successful:', response)),
        catchError((error) => {
          console.error('❌ Reset password failed:', error);
          return throwError(() => error);
        })
      );
  }

  // =============== 🔄 8. REFRESH TOKEN ===============

  refreshToken(): Observable<RefreshTokenResponse> {
    if (!this.isBrowser) {
      return of({ token: '', refreshToken: '', expiresIn: 0 });
    }

    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<RefreshTokenResponse>(`${this.apiUrl}/Auth/refresh-token`, {
      refreshToken: refreshToken
    }).pipe(
      tap((response) => {
        console.log('✅ Token refreshed successfully');
        this.saveTokens(response.token, response.refreshToken, response.expiresIn);
      }),
      catchError((error) => {
        console.error('❌ Token refresh failed:', error);
        this.logout();
        return throwError(() => error);
      })
    );
  }
  // =============== 👋 9. Register Business Owner ===============
  registerOwner(ownerData:object):Observable<any>{
    return this.http.post(`https://talentreeplateform.runasp.net/api/Auth/register-business-owner`,ownerData)
  }
  // =============== 👋 10. LOGOUT ===============

  logout(): Observable<{ message: string }> {
    if (!this.isBrowser) {
      this.clearAuthData();
      this.clearVerificationState();
      return of({ message: 'Logged out' });
    }

    const refreshToken = this.getRefreshToken();

    if (refreshToken) {
      return this.http.post<{ message: string }>(`${this.apiUrl}/Auth/logout`, {
        refreshToken: refreshToken
      }).pipe(
        tap(() => {
          console.log('✅ Logout successful');
          this.clearAuthData();
          this.clearVerificationState();
          this.router.navigate(['/auth/login']);
        }),
        catchError((error) => {
          console.warn('⚠️ Logout error:', error);
          this.clearAuthData();
          this.clearVerificationState();
          this.router.navigate(['/auth/login']);
          return throwError(() => error);
        })
      );
    } else {
      this.clearAuthData();
      this.clearVerificationState();
      this.router.navigate(['/auth/login']);
      return of({ message: 'Logged out locally' });
    }
  }

  // =============== 🟢 VERIFICATION HELPERS ===============

  private setPendingVerification(email: string): void {
    if (!this.isBrowser) return;
    this.storage.setItem('pending_verification_email', email, { prefix: '' });
    this.storage.setItem('verification_sent_at', Date.now().toString(), { prefix: '' });
    this.storage.setItem('needs_verification', 'true', { prefix: '' });
    console.log('📧 Pending verification set for:', email);
  }

  clearVerificationState(): void {
    if (!this.isBrowser) return;
    this.storage.removeItem('pending_verification_email', { prefix: '' });
    this.storage.removeItem('verification_sent_at', { prefix: '' });
    this.storage.removeItem('needs_verification', { prefix: '' });
    this.storage.removeItem('verification_code', { prefix: '' });
    console.log('🧹 Verification state cleared');
  }

  getPendingVerificationEmail(): string | null {
    if (!this.isBrowser) return null;
    return this.storage.getItem('pending_verification_email', { prefix: '' });
  }

  // =============== 🛠️ HELPER METHODS ===============

  private handleAuthSuccess(response: LoginResponse): void {
    const normalizedResponse = this.normalizeLoginResponse(response);
    this.saveTokens(normalizedResponse.token, normalizedResponse.refreshToken, normalizedResponse.expiresIn);
    this.saveUser(normalizedResponse.user);
    this.currentUserSubject.next(normalizedResponse.user);
    this.isAuthenticatedSubject.next(true);
    this.clearVerificationState();

    if (this.isBrowser) {
      this.redirectBasedOnRole(normalizedResponse.user.role);
    }
  }

  private saveTokens(token: string, refreshToken: string, expiresIn: number): void {
    if (!this.isBrowser) return;
    this.storage.setItem('token', token, { prefix: 'auth_' });
    if (refreshToken) {
      this.storage.setItem('refreshToken', refreshToken, { prefix: 'auth_' });
    }
    if (expiresIn) {
      const expiryDate = new Date();
      expiryDate.setSeconds(expiryDate.getSeconds() + expiresIn);
      this.storage.setItem('tokenExpiry', expiryDate.toISOString(), { prefix: 'auth_' });
    }
  }

  private saveUser(user: User): void {
    if (!this.isBrowser) return;
    this.storage.setObject('user', user, { prefix: 'auth_' });
  }

  public clearAuthData(): void {
    if (!this.isBrowser) return;
    this.storage.clear('auth_');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    console.log('🧹 Auth data cleared');
  }

  private normalizeLoginResponse(response: any): LoginResponse {

  const data = response.data || response;

  const user = data.user || {};

  return {
    token: data.accessToken || data.token || '',
    refreshToken: data.refreshToken || '',
    expiresIn: 3600,
    user: {
      id: user.id || '',
      email: user.email || '',
      firstName: user.displayName?.split(' ')[0] || '',
      lastName: user.displayName?.split(' ')[1] || '',
      role: user.roles?.[0] || user.role || 'Customer', // 🔥 VERY IMPORTANT
      phoneNumber: user.phoneNumber || '',
      isEmailVerified: user.isEmailVerified || false,
      createdAt: user.createdAt || new Date().toISOString()
    }
  };
}

  private parseExpiresIn(expiresIn: any): number {
    if (typeof expiresIn === 'number') return expiresIn;
    if (typeof expiresIn === 'string') {
      const parsed = parseInt(expiresIn, 10);
      if (!isNaN(parsed)) return parsed;
    }
    return 3600;
  }

  private redirectBasedOnRole(role: string): void {
    if (!this.isBrowser) return;

    const lowerRole = role.toLowerCase();
    switch (lowerRole) {
      case 'customer':
        this.router.navigate(['/customer/profile']);
        break;
      case 'businessowner':
      case 'supplier':
      case 'vendor':
        this.router.navigate(['/businessowner/bohome']);
        break;
      case 'admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      default:
        this.router.navigate(['/']);
        break;
    }
  }

  // =============== 🔍 GETTER METHODS ===============

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return this.storage.getItem('token', { prefix: 'auth_' });
  }

  getRefreshToken(): string | null {
    if (!this.isBrowser) return null;
    return this.storage.getItem('refreshToken', { prefix: 'auth_' });
  }

  getTokenExpiry(): Date | null {
    if (!this.isBrowser) return null;
    const expiry = this.storage.getItem('tokenExpiry', { prefix: 'auth_' });
    return expiry ? new Date(expiry) : null;
  }

  isLoggedIn(): boolean {
    if (!this.isBrowser) return false;
    const token = this.getToken();
    return !!token && !this.isTokenExpired();
  }

  isTokenExpired(): boolean {
    const expiry = this.getTokenExpiry();
    if (!expiry) return true;
    return new Date() >= expiry;
  }

  isTokenExpiringSoon(minutes: number = 5): boolean {
    const expiry = this.getTokenExpiry();
    if (!expiry) return false;
    const timeUntilExpiry = expiry.getTime() - new Date().getTime();
    const minutesUntilExpiry = timeUntilExpiry / (1000 * 60);
    return minutesUntilExpiry < minutes && minutesUntilExpiry > 0;
  }

  // =============== 🚨 ERROR HANDLING ===============

  private handleError(operation: string) {
    return (error: HttpErrorResponse): Observable<never> => {
      console.error(`❌ ${operation} failed:`, error);

      let errorMessage = 'An unexpected error occurred';

      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.error?.title) {
        errorMessage = error.error.title;
      } else if (error.status === 0) {
        errorMessage = 'Unable to connect to server';
      } else {
        errorMessage = `Server error: ${error.status}`;
      }

      return throwError(() => ({
        status: error.status,
        message: errorMessage,
        errors: error.error?.errors
      }));
    };
  }
}
