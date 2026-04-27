// src/app/core/services/base.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environments/envioronments';

@Injectable({
  providedIn: 'root'
})
export class BaseService {
  protected apiUrl = environment.apiUrl;

  constructor(
    protected http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object  // ← أضيفي هذا
  ) {}

  protected getToken(): string | null {
    // فقط في المتصفح نستخدم localStorage
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;  // في السيرفر نرجع null
  }

  protected getHeaders(): HttpHeaders {
    const token = this.getToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  protected getFormDataHeaders(): HttpHeaders {
    const token = this.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  protected buildParams(params: any): HttpParams {
    let httpParams = new HttpParams();
    if (!params) return httpParams;
    
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, value.toString());
      }
    });
    return httpParams;
  }

  protected get<T>(url: string, params?: any): Observable<T> {
    return this.http.get<T>(url, { 
      headers: this.getHeaders(), 
      params: this.buildParams(params) 
    }).pipe(catchError(this.handleError));
  }

  protected post<T>(url: string, body: any, useFormData: boolean = false): Observable<T> {
    const headers = useFormData ? this.getFormDataHeaders() : this.getHeaders();
    return this.http.post<T>(url, body, { headers })
      .pipe(catchError(this.handleError));
  }

  protected put<T>(url: string, body: any): Observable<T> {
    return this.http.put<T>(url, body, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  protected patch<T>(url: string, body: any): Observable<T> {
    return this.http.patch<T>(url, body, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  protected delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(url, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  protected getFullUrl(endpoint: string): string {
    if (!endpoint.startsWith('/')) endpoint = '/' + endpoint;
    return `${this.apiUrl}${endpoint}`;
  }

  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    let errorMessage = 'حدث خطأ غير متوقع';
    if (error.error?.message) errorMessage = error.error.message;
    else if (error.message) errorMessage = error.message;
    return throwError(() => new Error(errorMessage));
  }
}