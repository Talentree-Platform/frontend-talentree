import { Component, OnInit, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../modules/auth/services/auth.service'; // ⚠️ عدّلي المسار
import { UserRole } from '../../../../core/constants/roles.constants'; // ⚠️ عدّلي المسار
import { NotificationService } from '../../../../modules/business-owner/core/services/notification.service'; // ⚠️ عدّلي المسار لو مختلف

@Component({
  selector: 'app-admin-top-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './admin-header.component.html',
  styleUrl: './admin-header.component.scss'
})
export class AdminTopNavComponent implements OnInit {
  notifCount = 0;
  dropdownOpen = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.loadUnreadCount();
  }

  loadUnreadCount(): void {
    this.notificationService.getUnreadCount().subscribe({
      next: (count) => (this.notifCount = count),
      error: () => {},
    });
  }

  get currentUserName(): string {
    const user = this.authService.getCurrentUser();
    if (!user) return 'Admin';
    const fullName = `${user.firstName} ${user.lastName}`.trim();
    return fullName || user.email || 'Admin';
  }

  get currentUserRoleLabel(): string {
    return this.authService.getCurrentUser()?.role || 'Administrator';
  }

  get isSuperAdmin(): boolean {
    return this.authService.getCurrentUser()?.role === UserRole.SuperAdmin;
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.dropdownOpen = false;
  }

  logout() {
    this.dropdownOpen = false;
    this.authService.logout().subscribe({
      error: () => { } // AuthService بيعمل clearAuthData + redirect حتى لو فشل الـ request
    });
  }

  navigateTo(path: string) {
    this.dropdownOpen = false;
    this.router.navigate([path]);
  }
}