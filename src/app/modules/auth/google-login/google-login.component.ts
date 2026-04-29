import { Component, EventEmitter, Output, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SocialAuthService } from '../services/social-auth.service';

declare global {
  interface Window {
    google?: any;
  }
}

@Component({
  selector: 'app-google-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button *ngIf="isBrowser" 
            class="btn-google" 
            (click)="loginWithGoogle()" 
            [disabled]="loading">
      <span class="google-icon">G</span>
      <span>{{ loading ? 'Loading...' : 'Google' }}</span>
    </button>
  `,
  styles: [`
    .btn-google {
      flex: 1;
      padding: 12px 24px;
      border-radius: 100px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.25s ease;
      border: 1.5px solid #d4af37;
      background: white;
      color: #b38f2c;
      display: flex;
      align-items: center;
      justify-content: center;
      letter-spacing: 0.3px;
      width: 100%;
    }
    .btn-google:hover:not(:disabled) {
      background: #d4af37;
      color: white;
      transform: translateY(-1px);
      box-shadow: 0 8px 20px -5px rgba(212, 175, 55, 0.4);
    }
    .btn-google:active:not(:disabled) {
      transform: translateY(0);
    }
    .btn-google:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .google-icon {
      font-weight: bold;
      margin-right: 8px;
    }
  `]
})
export class GoogleLoginComponent implements OnInit {
  @Output() onSuccess = new EventEmitter<any>();
  @Output() onError = new EventEmitter<any>();

  private clientId = '84778196015-9ur8mod94qhvbmk5hsq3v1jb0ftcocsr.apps.googleusercontent.com';
  loading = false;
  isBrowser: boolean;

  constructor(
    private socialAuth: SocialAuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.loadGoogleScript();
    }
  }

  private loadGoogleScript(): void {
    if (!this.isBrowser) return;
    
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => console.log('Google script loaded');
    script.onerror = (error) => this.onError.emit(error);
    document.head.appendChild(script);
  }

  loginWithGoogle(): void {
    if (!this.isBrowser) return;

    if (!window.google?.accounts?.id) {
      this.loadGoogleScript();
      setTimeout(() => this.loginWithGoogle(), 1000);
      return;
    }

    this.loading = true;

    // تهيئة المكتبة مرة واحدة
    window.google.accounts.id.initialize({
      client_id: this.clientId,
      callback: (response: any) => this.handleCredentialResponse(response),
      auto_select: false,
      cancel_on_tap_outside: true,
      ux_mode: 'popup'
    });

    // فتح النافذة المنبثقة
    window.google.accounts.id.prompt();
  }

  private handleCredentialResponse(response: any): void {
    if (response.credential) {
      this.socialAuth.googleLogin(response.credential).subscribe({
        next: (result) => {
          this.loading = false;
          this.onSuccess.emit(result);
        },
        error: (error) => {
          this.loading = false;
          this.onError.emit(error);
        }
      });
    } else {
      this.loading = false;
      this.onError.emit({ message: 'Google login cancelled' });
    }
  }
}