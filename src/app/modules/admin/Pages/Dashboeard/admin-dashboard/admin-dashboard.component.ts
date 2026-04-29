import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AdminService } from '../../../core/services/admin.service';

interface StatCard {
  label: string;
  value: number;
  icon: string;
  colorClass: string;
  badgeText: string;
  badgeClass: string;
  route: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  loading = signal(true);

  pendingOwnersCount  = signal(0);
  pendingProductsCount = signal(0);
  activeAdminsCount   = signal(0);

  // بيانات آخر 4 owners عشان الـ quick list
  recentOwners = signal<any[]>([]);

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    forkJoin({
      owners:   this.adminService.getPendingBusinessOwner({ pageIndex: 1, pageSize: 4 }),
      products: this.adminService.getPendingProducts(1, 4),
      admins:   this.adminService.getAllAdmins()
    }).subscribe({
      next: ({ owners, products, admins }) => {

        // counts
        this.pendingOwnersCount.set(owners.data.count);
        this.pendingProductsCount.set(products.data.count);
        this.activeAdminsCount.set(
          admins.data.filter((a: any) => a.isActive).length
        );

        // recent owners list
        this.recentOwners.set(owners.data.data);

        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  // helper عشان أول حرفين من الاسم
  initials(name: string): string {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }

  // لون الـ avatar حسب الاسم
  avatarColor(name: string): string {
    const colors = ['blue', 'green', 'amber', 'purple', 'red'];
    return colors[name.charCodeAt(0) % colors.length];
  }

  // approve مباشر من الـ dashboard
  approveOwner(profileId: number): void {
    this.adminService.ApproveOwner(profileId, '').subscribe(() => {
      this.recentOwners.update(list =>
        list.filter(o => o.profileId !== profileId)
      );
      this.pendingOwnersCount.update(n => n - 1);
    });
  }

  // reject مباشر من الـ dashboard
  rejectOwner(profileId: number): void {
    this.adminService.rejectOwner(profileId, 'Rejected from dashboard').subscribe(() => {
      this.recentOwners.update(list =>
        list.filter(o => o.profileId !== profileId)
      );
      this.pendingOwnersCount.update(n => n - 1);
    });
  }
}