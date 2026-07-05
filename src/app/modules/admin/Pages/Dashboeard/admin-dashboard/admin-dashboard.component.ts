import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminService } from '../../../core/services/admin.service';
import { AdminManagementService } from '../../../core/services/adminManagment.service';
import { AdminProductService } from '../../../core/services/admin-products.service';
import { AdminAiOverviewComponent } from '../admin-ai-overview/admin-ai-overview.component';
import { AuthService } from '../../../../auth/services/auth.service'; // ⚠️ عدّلي المسار حسب مكانه عندك لو مختلف

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminAiOverviewComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  loading = signal(true);
  pendingOwnersCount = signal(0);
  pendingProductsCount = signal(0);
  activeAdminsCount = signal(0);
  recentOwners = signal<any[]>([]);

  // ── Role flags (تتحدد مرة واحدة من بيانات اليوزر المسجل دخوله) ──
  isSuperAdmin = false;
  isAdmin = false;

  constructor(
    private adminService: AdminService,
    private adminManagementService: AdminManagementService,
    private productService: AdminProductService,
    private authService: AuthService,
  ) {
    const role = (this.authService.getCurrentUser()?.role ?? '').trim().toLowerCase();
    this.isSuperAdmin = role === 'superadmin';
    this.isAdmin = role === 'admin';
  }

  ngOnInit(): void {
    forkJoin({
      // Pending owners: مشتركة بين Admin و SuperAdmin
      owners: this.adminService.getPendingBusinessOwner({ pageIndex: 1, pageSize: 4 }).pipe(
        catchError(() => of(null))
      ),
      // Pending products: Admin بس
      products: this.isAdmin
        ? this.productService.getPendingProducts(1, 4).pipe(catchError(() => of(null)))
        : of(null),
      // Active admins: SuperAdmin بس
      admins: this.isSuperAdmin
        ? this.adminManagementService.getAllAdmins().pipe(catchError(() => of(null)))
        : of(null),
    }).subscribe({
      next: (results) => {
        if (results.owners) {
          this.pendingOwnersCount.set(results.owners.data.count);
          this.recentOwners.set(results.owners.data.data);
        }
        if (results.products) {
          this.pendingProductsCount.set(results.products.data.count);
        }
        if (results.admins) {
          this.activeAdminsCount.set(results.admins.data.filter((a: any) => a.isActive).length);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  initials(name: string): string {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }

  avatarColor(name: string): string {
    const colors = ['blue', 'green', 'amber', 'purple', 'red'];
    return colors[name.charCodeAt(0) % colors.length];
  }

  approveOwner(profileId: number): void {
    this.adminService.ApproveOwner(profileId, '').subscribe(() => {
      this.recentOwners.update(list => list.filter(o => o.profileId !== profileId));
      this.pendingOwnersCount.update(n => n - 1);
    });
  }

  rejectOwner(profileId: number): void {
    this.adminService.rejectOwner(profileId, 'Rejected from dashboard').subscribe(() => {
      this.recentOwners.update(list => list.filter(o => o.profileId !== profileId));
      this.pendingOwnersCount.update(n => n - 1);
    });
  }
}