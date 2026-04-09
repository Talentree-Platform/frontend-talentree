import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SocialAuthService {
  private apiUrl = 'https://talentreeplateform.runasp.net';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // ✅ Google Login - مع provider
  googleLogin(idToken: string): Observable<any> {
    console.log('🔐 Google Login - sending to backend');
    
    // الـ API ينتظر idToken و provider معًا
    const body = {
      idToken: idToken,
      provider: 'Google'
    };

    console.log('📤 Sending to:', `${this.apiUrl}/api/Auth/google-login`);
    console.log('📤 Body:', { 
      idToken: idToken.substring(0, 30) + '...', 
      provider: 'Google' 
    });

    return this.http.post(`${this.apiUrl}/api/Auth/google-login`, body)
      .pipe(
        tap((response: any) => {
          console.log('✅ Google login successful', response);
          if (this.authService['normalizeLoginResponse']) {
            const normalizedResponse = this.authService['normalizeLoginResponse'](response);
            this.authService['handleAuthSuccess'](normalizedResponse);
          }
        }),
        catchError((error) => {
          console.error('❌ Google login failed:', error);
          throw error;
        })
      );
  }

  // ✅ Facebook Login - مع provider
  facebookLogin(accessToken: string): Observable<any> {
    console.log('🔐 Facebook Login - sending to backend');
    
    // الـ API ينتظر idToken و provider معًا
    const body = {
      idToken: accessToken,
      provider: 'Facebook'
    };

    console.log('📤 Sending to:', `${this.apiUrl}/api/Auth/facebook-login`);
    console.log('📤 Body:', { 
      idToken: accessToken.substring(0, 30) + '...', 
      provider: 'Facebook' 
    });

    return this.http.post(`${this.apiUrl}/api/Auth/facebook-login`, body)
      .pipe(
        tap((response: any) => {
          console.log('✅ Facebook login successful', response);
          if (this.authService['normalizeLoginResponse']) {
            const normalizedResponse = this.authService['normalizeLoginResponse'](response);
            this.authService['handleAuthSuccess'](normalizedResponse);
          }
        }),
        catchError((error) => {
          console.error('❌ Facebook login failed:', error);
          throw error;
        })
      );
  }
}