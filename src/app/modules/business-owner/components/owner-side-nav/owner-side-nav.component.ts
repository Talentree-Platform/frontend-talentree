import { AuthService } from './../../../auth/services/auth.service';
import { Component, EventEmitter, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

export interface NavItem {
  key: string;
  label: string;
  description: string;
  route?: string;
  icon: string;
  submenu?: { label: string; route?: string; key: string }[];
}

@Component({
  selector: 'app-owner-side-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './owner-side-nav.component.html',
  styleUrl: './owner-side-nav.component.css'
})
export class OwnerSideNavComponent {

  constructor(private authService: AuthService) { }

  isExpanded: boolean = false;
  @Output() expandedChange = new EventEmitter<boolean>();

  expandedItems: { [key: string]: boolean } = {};
  activeItem: string = 'home';

  // ── Tooltip state ──────────────────────────────────────
  hoveredItem: string | null = null;
  tooltipTop: number = 0;

  // ── Nav data ───────────────────────────────────────────
  navItems: NavItem[] = [
    {
      key: 'home',
      label: 'Home',
      description: 'Go to dashboard overview',
      route: '/businessowner/bohome',
      icon: `M2.25 12 11.204 3.045c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25`,
      submenu: [
        { key: 'dashboard', label: 'Dashboard', route: '/businessowner/bohome' }
      ]
    },
    {
      key: 'products',
      label: 'Products',
      description: 'Manage your product catalog',
      route: '/businessowner/ownerProduct',
      icon: `M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3`,
      submenu: [
        { key: 'all-products', label: 'All Products', route: '/businessowner/ownerProduct' },
        { key: 'add-product', label: 'Add Product', route: '/businessowner/ownerAddProduct' }
      ]
    },
    {
      key: 'orders',
      label: 'Orders',
      description: 'Track and manage all orders',
      icon: `M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z`,
      submenu: [
        { key: 'all-orders', label: 'All Orders' },
        { key: 'pending', label: 'Pending' },
        { key: 'shipped', label: 'Shipped' },
        { key: 'delivered', label: 'Delivered' },
        { key: 'refunds', label: 'Refunds & Disputes' }
      ]
    },
    {
      key: 'raw-material',
      label: 'Raw Material',
      description: 'Browse and purchase materials',
      route: '/businessowner/rawmaterialhome',
      icon: `M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z`,
      submenu: [
        { key: 'store', label: 'Store', route: '/businessowner/rawmaterialhome' },
        { key: 'my-purchases', label: 'My Purchases', route: '/businessowner/rawmaterialcart' }
      ]
    },
    {
      key: 'industry',
      label: 'Industry',
      description: 'Industry Request',
      route: '/businessowner/ownerProductionRequestList',
      icon: `M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z`
    },
    {
      key: 'financial',
      label: 'Financial Insights',
      description: 'Revenue, expenses & reports',
      route: '/businessowner/financial',
      icon: `M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z`,
      submenu: [
        { key: 'overview', label: 'Overview' },
        { key: 'expenses', label: 'Expenses' },
        { key: 'payouts', label: 'Payouts' },
        { key: 'reports', label: 'Reports' }
      ]
    },
    {
      key: 'review',
      label: 'Review',
      description: 'Customer feedback & ratings',
      route: '/businessowner/reviews',
      icon: `M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z`,
      submenu: [
        { key: 'review-reports', label: 'Reports' },
        { key: 'customer-feedback', label: 'Customer Feedback' }
      ]
    },
    {
      key: 'support',
      label: 'Support & Services',
      description: 'Help center and tickets',
      icon: `M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z`,
      submenu: [
        { key: 'my-tickets', label: 'My Tickets' },
        { key: 'service', label: 'Service' },
        { key: 'help-center', label: 'Help Center' }
      ]
    },
    {
      key: 'ai-tool',
      label: 'Smart AI Tool',
      description: 'AI-powered business assistant',
      icon: `m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z`,
      submenu: [
        { key: 'business-assistant', label: 'Business Assistant' },
        { key: 'price-agent', label: 'Price Agent' },
        { key: 'marketing-plan', label: 'Marketing Plan' }
      ]
    },
    {
      key: 'settings',
      label: 'Settings',
      description: 'Account, security & preferences',
      route: '/businessowner/settingmain',
      icon: `M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z`,
      submenu: [
        { key: 'profile', label: 'Profile Information', route: '/businessowner/settingmain' },
        { key: 'business-details', label: 'Business Details', route: '/businessowner/settingbusinessdetails' },
        { key: 'payment-billing', label: 'Payment & Billing', route: '/businessowner/settingpaymentbilling' },
        { key: 'security-privacy', label: 'Security & Privacy', route: '/businessowner/settingpreference' },
        { key: 'preferences', label: 'Preferences & Notifications', route: '/businessowner/settingsecurity' }
      ]
    }
  ];

  // ── Sidebar toggle ─────────────────────────────────────
  toggleSidebar(): void {
    this.isExpanded = !this.isExpanded;
    this.expandedChange.emit(this.isExpanded);

    if (!this.isExpanded) {
      this.expandedItems = {};
      this.hoveredItem = null; // clear tooltip when collapsing
    }
  }

  // ── Submenu toggle ─────────────────────────────────────
  toggleSubmenu(item: string): void {
    if (this.isExpanded) {
      this.expandedItems[item] = !this.expandedItems[item];
    }
  }

  // ── Active item ────────────────────────────────────────
  setActive(item: string): void {
    this.activeItem = item;
  }

  // ── Tooltip handlers ───────────────────────────────────
  onIconMouseEnter(event: MouseEvent, key: string): void {
    if (this.isExpanded) return; // only show when collapsed
    this.hoveredItem = key;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.tooltipTop = rect.top + rect.height / 2;
  }

  onIconMouseLeave(): void {
    this.hoveredItem = null;
  }

  // ── Auth ───────────────────────────────────────────────
  logout(): void {
    this.authService.logout().subscribe();
  }
}