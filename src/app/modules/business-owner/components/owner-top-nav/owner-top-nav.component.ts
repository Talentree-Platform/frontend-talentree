import { RouterLink, RouterLinkActive } from '@angular/router';
import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { MaterialCartService } from '../../core/services/material-cart.service';
import { BoThemeService } from '../../../../core/services/bo-theme.service';
import { AuthService } from '../../../auth/services/auth.service';
import { OwnerSettingService } from '../../core/services/owner-setting.service';


@Component({
  selector: 'app-owner-top-nav',
  standalone: true,
  imports: [RouterLink , RouterLinkActive],
  templateUrl: './owner-top-nav.component.html',
  styleUrl: './owner-top-nav.component.css'
})

export class OwnerTopNavComponent implements OnInit {
  constructor(
    private _MaterialCartService: MaterialCartService,
    public themeSvc: BoThemeService,
    private authService: AuthService,
    private _OwnerSettingService: OwnerSettingService,
    private elementRef: ElementRef
  ) {}

cartCount = 0;
isProfileMenuOpen = false;
userName = '';
userEmail = '';
profileImageUrl: string | null = null;
readonly defaultAvatar = './assets/images/olive.jpg';

ngOnInit() {
  this._MaterialCartService.loadCartCount();
  this._MaterialCartService.count$.subscribe(count => {
    this.cartCount = count;
  });

  this.authService.currentUser$.subscribe(user => {
    this.userName = user ? `${user.firstName} ${user.lastName}`.trim() : '';
    this.userEmail = user?.email ?? '';
  });

  this._OwnerSettingService.profileImage$.subscribe(url => {
    this.profileImageUrl = url;
  });
  this._OwnerSettingService.refreshCurrentProfile();
}

onAvatarError(event: Event): void {
  const img = event.target as HTMLImageElement;
  img.src = this.defaultAvatar;
}

toggleTheme() {
  this.themeSvc.toggle();
}

toggleProfileMenu() {
  this.isProfileMenuOpen = !this.isProfileMenuOpen;
}

logout() {
  this.isProfileMenuOpen = false;
  this.authService.logout().subscribe();
}

@HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent) {
  if (this.isProfileMenuOpen && !this.elementRef.nativeElement.contains(event.target)) {
    this.isProfileMenuOpen = false;
  }
}

}
