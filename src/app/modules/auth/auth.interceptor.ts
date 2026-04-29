
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../modules/auth/services/auth.service';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  //req = current request
  //next(req) = send it to the next interceptor or backend
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // URLs التي لا تحتاج token
  const publicUrls = [
    '/Auth/register',
    '/Auth/login',
    '/Auth/verify-email',
    '/Auth/forgot-password',
    '/Auth/reset-password',
    '/Auth/google-login',
    '/Auth/facebook-login',
    '/Auth/register-business-owner'
  ];
  
  const isPublicUrl = publicUrls.some(url => req.url.includes(url));
  
  // إذا كان الطلب عاماً، أرسله بدون token
  if (isPublicUrl) {
    return next(req);
  }
  
  // الحصول على الـ token
  const token = authService.getToken();
  
  // إذا لم يكن هناك token وكان الطلب يحتاج إليه
  if (!token) {
    console.warn('⚠️ No token found for protected route');
    router.navigate(['/auth/login']);
    return throwError(() => new Error('No authentication token'));
  }
  
  // إضافة الـ token للـ headers
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return next(authReq).pipe(
    catchError((error) => {
      // إذا كان الخطأ 401 (غير مصرح)
      if (error.status === 401 && !req.url.includes('/Auth/refresh-token')) {
        console.log('🔐 Token expired, attempting refresh...');
        
        // محاولة تجديد الـ token
        return authService.refreshToken().pipe(
          switchMap((refreshResponse) => {
            // إعادة محاولة الطلب الأصلي مع الـ token الجديد
            const newToken = refreshResponse.token;
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            // إذا فشل refresh، سجل الخروج
            console.error('🚨 Token refresh failed, logging out');
            authService.clearAuthData();
            router.navigate(['/auth/login'], {
              queryParams: { sessionExpired: true }
            });
            return throwError(() => refreshError);
          })
        );
      }
      
      // إذا كان خطأ 403 (ممنوع)
      if (error.status === 403) {
        console.error('🚨 Access forbidden');
        router.navigate(['/auth/login'], {
          queryParams: { error: 'forbidden' }
        });
      }
      
      return throwError(() => error);
    })
  );
};