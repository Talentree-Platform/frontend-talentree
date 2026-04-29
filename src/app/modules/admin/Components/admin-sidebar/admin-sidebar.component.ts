import { Component, EventEmitter, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

export interface NavItem {
  key: string;
  label: string;
  description: string;
  route?: string;
  icon: string;
  badge?: number;
  badgeColor?: 'warn' | 'danger' | 'info';
  submenu?: { label: string; route?: string; key: string }[];
}

@Component({
  selector: 'app-admin-side-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.css'
})
export class AdminSideNavComponent {

  isExpanded: boolean = false;
  @Output() expandedChange = new EventEmitter<boolean>();

  expandedItems: { [key: string]: boolean } = {};
  activeItem: string = 'dashboard';

  hoveredItem: string | null = null;
  tooltipTop: number = 0;

  navItems: NavItem[] = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      description: 'Admin overview & quick actions',
      route: '/admin/dashboard',
      icon: `M3 3h7v7H3zm0 11h7v7H3zm11-11h7v7h-7zm0 11h7v7h-7z`
    },
    {
      key: 'pendingbo',
      label: 'Business Owners',
      description: 'Review and approve owner requests',
      route: '/admin/pendingbo',
      badge: 12,
      badgeColor: 'warn',
      icon: `M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8m14 14v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75`,
      submenu: [
        { key: 'pending-list', label: 'Pending Owners', route: '/admin/pendingbo' }
      ]
    },
    {
      key: 'adminlist',
      label: 'Admins',
      description: 'Manage administrator accounts',
      route: '/admin/adminlist',
      icon: `M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z`,
      submenu: [
        { key: 'admin-list', label: 'All Admins', route: '/admin/adminlist' }
      ]
    },
    {
      key: 'products',
      label: 'Products',
      description: 'Review and manage product catalog',
      badge: 8,
      badgeColor: 'warn',
      icon: `M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0`,
      submenu: [
        { key: 'product-home', label: 'All Products', route: '/admin/producthome' },
        { key: 'production-requests', label: 'Production Requests', route: '/admin/production-requests' }
      ]
    },
    {
      key: 'inventory',
      label: 'Inventory',
      description: 'Raw materials & supplier management',
      badge: 4,
      badgeColor: 'danger',
      icon: `M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96 12 12.01l8.73-5.05M12 22.08V12`,
      submenu: [
        { key: 'rawmaterials', label: 'Raw Materials', route: '/admin/rawmaterials' },
        { key: 'suppliers', label: 'Suppliers', route: '/admin/suppliers' }
      ]
    }
  ];

  toggleSidebar(): void {
    this.isExpanded = !this.isExpanded;
    this.expandedChange.emit(this.isExpanded);
    if (!this.isExpanded) {
      this.expandedItems = {};
      this.hoveredItem = null;
    }
  }

  toggleSubmenu(item: string): void {
    if (this.isExpanded) {
      this.expandedItems[item] = !this.expandedItems[item];
    }
  }

  setActive(item: string): void {
    this.activeItem = item;
  }

  onIconMouseEnter(event: MouseEvent, key: string): void {
    if (this.isExpanded) return;
    this.hoveredItem = key;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.tooltipTop = rect.top + rect.height / 2;
  }

  onIconMouseLeave(): void {
    this.hoveredItem = null;
  }
}