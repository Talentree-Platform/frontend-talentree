import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AdminService } from '../../../core/services/admin.service';
import { AdminManagementService } from '../../../core/services/adminManagment.service';
import { AdminProductService } from '../../../core/services/admin-products.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  loading = signal(true);
  pendingOwnersCount = signal(0);
  pendingProductsCount = signal(0);
  activeAdminsCount = signal(0);
  recentOwners = signal<any[]>([]);

  constructor(
    private adminService: AdminService,
    private adminManagementService: AdminManagementService,
    private productService: AdminProductService,  // ← أضيفي ده
  ) { }

  ngOnInit(): void {
    forkJoin({
      owners: this.adminService.getPendingBusinessOwner({ pageIndex: 1, pageSize: 4 }),
      admins: this.adminManagementService.getAllAdmins(),
      products: this.productService.getPendingProducts(1, 4),
    }).subscribe({
      next: (results) => {   // ← بدل destructuring، استخدمي results
        this.pendingOwnersCount.set(results.owners.data.count);
        this.pendingProductsCount.set(results.products.data.count);
        this.activeAdminsCount.set(results.admins.data.filter((a: any) => a.isActive).length);
        this.recentOwners.set(results.owners.data.data);
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
    this.adminService.approveOwner(profileId, '').subscribe(() => {  // ← lowercase
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