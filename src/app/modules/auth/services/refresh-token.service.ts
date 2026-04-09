// src/app/core/services/refresh-token.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, timer } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { filter } from 'rxjs/operators';

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
  user?: any;
}

@Injectable({
  providedIn: 'root'
})
export class RefreshTokenService {
  private apiUrl = 'https://talentreeplateform.runasp.net/api';
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);
  private refreshResponseSubject = new BehaviorSubject<RefreshTokenResponse | null>(null);
  
  // Timer لتجديد الـ token قبل انتهاء صلاحيته بـ 5 دقائق
  private refreshTimer: any;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {
    // بدء مراقبة الـ token عند بدء الخدمة
    this.startTokenMonitoring();
  }

  // =============== 🔄 Main Refresh Methods ===============

  /**
   * تجديد الـ token تلقائياً
   */
  refreshToken(): Observable<RefreshTokenResponse> {
    // إذا كان هناك عملية refresh جارية، انتظر
    if (this.isRefreshing) {
      return this.refreshResponseSubject.asObservable().pipe(
        filter((response): response is RefreshTokenResponse => response !== null)
      );
    }

    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);

    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      this.handleNoRefreshToken();
      return throwError(() => new Error('No refresh token available'));
    }

    console.log('🔄 Attempting to refresh token...');

    return this.http.post<RefreshTokenResponse>(`${this.apiUrl}/Auth/refresh-token`, {
      refreshToken: refreshToken
    }).pipe(
      tap((response: RefreshTokenResponse) => {
        console.log('✅ Token refreshed successfully');
        this.handleSuccessfulRefresh(response);
        this.refreshTokenSubject.next(response.token);
      }),
      catchError((error) => {
        console.error('❌ Token refresh failed:', error);
        this.handleRefreshError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * تجديد الـ token يدوياً (مفيد عند فشل طلب)
   */
  manualRefresh(): Promise<boolean> {
    return new Promise((resolve) => {
      this.refreshToken().subscribe({
        next: () => resolve(true),
        error: () => resolve(false)
      });
    });
  }

  // =============== ⏰ Token Monitoring ===============

  /**
   * بدء مراقبة صلاحية الـ token
   */
  private startTokenMonitoring(): void {
    // تحقق من صلاحية الـ token كل 30 ثانية
    timer(0, 30000).subscribe(() => {
      this.checkTokenValidity();
    });

    // مراقبة نشاط المستخدم لتجنب تسجيل الخروج
    this.setupUserActivityMonitoring();
  }

  /**
   * التحقق من صلاحية الـ token
   */
  private checkTokenValidity(): void {
    if (!this.authService.isLoggedIn()) {
      return;
    }

    const tokenExpiry = this.getTokenExpiry();
    
    if (!tokenExpiry) {
      console.warn('⚠️ No token expiry found');
      return;
    }

    const now = new Date();
    const expiryDate = new Date(tokenExpiry);
    const timeUntilExpiry = expiryDate.getTime() - now.getTime();
    
    // إذا بقي أقل من 5 دقائق على انتهاء الصلاحية، قم بالتجديد
    const fiveMinutes = 5 * 60 * 1000;
    
    if (timeUntilExpiry < fiveMinutes && timeUntilExpiry > 0) {
      console.log(`⏰ Token expires in ${Math.round(timeUntilExpiry / 1000)} seconds. Refreshing...`);
      this.scheduleTokenRefresh();
    } else if (timeUntilExpiry <= 0) {
      console.warn('⚠️ Token has expired');
      this.handleExpiredToken();
    }
  }

  /**
   * جدولة تجديد الـ token
   */
  private scheduleTokenRefresh(): void {
    // إلغاء أي timer سابق
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // احسب الوقت المتبقي
    const tokenExpiry = this.getTokenExpiry();
    if (!tokenExpiry) return;

    const now = new Date();
    const expiryDate = new Date(tokenExpiry);
    const timeUntilExpiry = expiryDate.getTime() - now.getTime();
    
    // جدولة التجديد قبل انتهاء الصلاحية بـ 1 دقيقة
    const refreshTime = Math.max(timeUntilExpiry - 60000, 1000);
    
    this.refreshTimer = setTimeout(() => {
      this.refreshToken().subscribe({
        error: () => this.handleRefreshFailure()
      });
    }, refreshTime);
    
    console.log(`⏰ Scheduled token refresh in ${Math.round(refreshTime / 1000)} seconds`);
  }

  // =============== 🛠️ Helper Methods ===============

  private getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  private getTokenExpiry(): string | null {
    return localStorage.getItem('tokenExpiry');
  }

  private handleSuccessfulRefresh(response: RefreshTokenResponse): void {
    // حفظ الـ tokens الجديدة
    localStorage.setItem('token', response.token);
    localStorage.setItem('refreshToken', response.refreshToken);
    
    // تحديث وقت الانتهاء
    if (response.expiresIn) {
      const expiryDate = new Date();
      expiryDate.setSeconds(expiryDate.getSeconds() + response.expiresIn);
      localStorage.setItem('tokenExpiry', expiryDate.toISOString());
    }
    
    // حفظ بيانات المستخدم إذا كانت موجودة
    if (response.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    this.isRefreshing = false;
    
    // إعادة جدولة التجديد التالي
    this.scheduleTokenRefresh();
  }

  private handleRefreshError(error: any): void {
    this.isRefreshing = false;
    this.refreshTokenSubject.next(null);
    
    // إذا كان الخطأ 401 أو 403 (غير مصرح)، سجل الخروج
    if (error.status === 401 || error.status === 403) {
      console.error('🚨 Refresh token invalid or expired. Logging out...');
      this.forceLogout();
    }
  }

  private handleNoRefreshToken(): void {
    console.warn('⚠️ No refresh token found');
    this.forceLogout();
  }

  private handleExpiredToken(): void {
    console.warn('⚠️ Token has expired, attempting refresh...');
    
    // حاول التجديد مرة واحدة
    this.refreshToken().subscribe({
      error: () => {
        console.error('🚨 Could not refresh expired token');
        this.forceLogout();
      }
    });
  }

  private handleRefreshFailure(): void {
    console.error('🚨 Scheduled token refresh failed');
    // يمكنك إضافة منطق لإعادة المحاولة أو إظهار تحذير
  }

  /**
   * تسجيل الخروج القسري
   */
  forceLogout(): void {
    console.log('👋 Force logging out due to token issues');
    
    // مسح جميع بيانات المصادقة
    this.authService.clearAuthData();
    
    // إلغاء أي timer نشط
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    
    // التوجيه لصفحة الدخول
    this.router.navigate(['/auth/login'], {
      queryParams: { sessionExpired: true }
    });
    
    // يمكنك إضافة رسالة للمستخدم
    setTimeout(() => {
      alert('انتهت جلستك، يرجى تسجيل الدخول مرة أخرى');
    }, 500);
  }

  // =============== 🎯 User Activity Monitoring ===============

  /**
   * مراقبة نشاط المستخدم لتجنب تسجيل الخروج أثناء الاستخدام
   */
  private setupUserActivityMonitoring(): void {
    // أحداث المستخدم التي تعتبر نشاط
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    activityEvents.forEach(event => {
      document.addEventListener(event, () => {
        this.resetInactivityTimer();
      }, { passive: true });
    });
    
    this.startInactivityTimer();
  }

  private inactivityTimer: any;
  private readonly INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 دقيقة

  private startInactivityTimer(): void {
    this.resetInactivityTimer();
  }

  private resetInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
    
    this.inactivityTimer = setTimeout(() => {
      console.log('⏰ User inactive for 30 minutes');
      // يمكنك إضافة منطق مثل تسجيل الخروج أو إظهار تحذير
    }, this.INACTIVITY_TIMEOUT);
  }

  // =============== 🔧 Public Methods ===============

  /**
   * إعادة تعيين الـ timer (مفيد عند تغيير الصفحة)
   */
  resetRefreshTimer(): void {
    this.scheduleTokenRefresh();
  }

  /**
   * الحصول على حالة الـ refresh الحالية
   */
  getRefreshStatus(): string {
    if (this.isRefreshing) {
      return 'refreshing';
    }
    return this.authService.isLoggedIn() ? 'active' : 'inactive';
  }

  /**
   * تنظيف الـ service (مفيد عند تسجيل الخروج)
   */
  cleanup(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
    
    this.isRefreshing = false;
    this.refreshTokenSubject.next(null);
  }
}