import { Component, EventEmitter, Output, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SocialAuthService } from '../services/social-auth.service';

declare global {
  interface Window {
    FB?: any;
    fbAsyncInit?: () => void;
  }
}

@Component({
  selector: 'app-facebook-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button *ngIf="isBrowser" class="btn-facebook" (click)="loginWithFacebook()" [disabled]="loading">
      <span class="facebook-icon">f</span>
      <span>{{ loading ? 'Loading...' : 'Facebook' }}</span>
    </button>
  `,
  styles: [`
    .btn-facebook {
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
    .btn-facebook:hover:not(:disabled) {
      background: #d4af37;
      color: white;
      transform: translateY(-1px);
      box-shadow: 0 8px 20px -5px rgba(212, 175, 55, 0.4);
    }
    .btn-facebook:active:not(:disabled) {
      transform: translateY(0);
    }
    .btn-facebook:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .facebook-icon {
      font-weight: bold;
      margin-right: 8px;
    }
  `]
})
export class FacebookLoginComponent implements OnInit {
  @Output() onSuccess = new EventEmitter<any>();
  @Output() onError = new EventEmitter<any>();

  private appId = '1294625039148322';
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
      this.loadFacebookScript();
    }
  }

  private loadFacebookScript(): void {
    if (!this.isBrowser) return;
    
    (window as any).fbAsyncInit = () => {
      window.FB.init({
        appId: this.appId,
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      });
    };

    const script = document.createElement('script');
    script.id = 'facebook-jssdk';
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }

  loginWithFacebook(): void {
    if (!this.isBrowser) return;
    
    if (!window.FB) {
      this.loadFacebookScript();
      setTimeout(() => this.loginWithFacebook(), 1000);
      return;
    }

    this.loading = true;

    window.FB.login((response: any) => {
      if (response.authResponse) {
        window.FB.api('/me', { fields: 'name,email,picture' }, (userInfo: any) => {
          this.socialAuth.facebookLogin(response.authResponse.accessToken).subscribe({
            next: (result) => {
              this.loading = false;
              this.onSuccess.emit(result);
            },
            error: (error) => {
              this.loading = false;
              this.onError.emit(error);
            }
          });
        });
      } else {
        this.loading = false;
        this.onError.emit({ message: 'User cancelled login' });
      }
    }, { scope: 'email,public_profile' });
  }
}