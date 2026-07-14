import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService, RefreshTokenResponse } from '../../modules/auth/services/auth.service';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, shareReplay, switchMap, throwError } from 'rxjs';

// Shared across all concurrent requests hitting this interceptor: when several
// requests 401 at once (e.g. a page firing multiple API calls in parallel),
// they must all wait on the SAME refresh call instead of each racing the
// backend with the same (single-use, rotated) refresh token — otherwise only
// the first refresh succeeds and the rest force a logout right after it.
let refreshInProgress$: Observable<RefreshTokenResponse> | null = null;

function addAuthHeaders(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  const extraHeaders: Record<string, string> = {
    Authorization: `Bearer ${token}`
  };

  if (req.method === 'GET') {
    extraHeaders['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    extraHeaders['Pragma'] = 'no-cache';
    extraHeaders['Expires'] = '0';
  }

  return req.clone({ setHeaders: extraHeaders });
}

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
  '/Auth/register-business-owner',
  '/Auth/change-forced-password',
  '/help-center'          // ✅ public – no token required for AI chat widget
];

const isPublicUrl = publicUrls.some(url => 
  req.url.toLowerCase().includes(url.toLowerCase())
);
  
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
  
  // إضافة الـ token للـ headers + منع الكاش للـ GET requests
  const authReq = addAuthHeaders(req, token);

  return next(authReq).pipe(
    catchError((error) => {
      // إذا كان الخطأ 401 (غير مصرح)
      if (error.status === 401 && !req.url.includes('/Auth/refresh-token')) {
        // Join the single shared refresh call instead of starting a new one —
        // avoids racing the backend with an already-rotated refresh token.
        if (!refreshInProgress$) {
          console.log('🔐 Token expired, attempting refresh...');

          refreshInProgress$ = authService.refreshToken().pipe(
            catchError((refreshError) => {
              console.error('🚨 Token refresh failed, logging out');
              authService.clearAuthData();
              router.navigate(['/auth/login'], {
                queryParams: { sessionExpired: true }
              });
              return throwError(() => refreshError);
            }),
            finalize(() => { refreshInProgress$ = null; }),
            shareReplay(1)
          );
        }

        return refreshInProgress$.pipe(
          switchMap((refreshResponse) => next(addAuthHeaders(req, refreshResponse.token)))
        );
      }

      // إذا كان خطأ 403 (ممنوع)
      if (error.status === 403) {
        console.error('🚨 Access forbidden');
      }

      return throwError(() => error);
    })
  );
};