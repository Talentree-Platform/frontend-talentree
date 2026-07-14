import { AuthService } from './../../../auth/services/auth.service';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { OwnerSettingService } from '../../core/services/owner-setting.service';

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
export class OwnerSideNavComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router,
    private _OwnerSettingService: OwnerSettingService
  ) { }

  isExpanded: boolean = false;
  @Output() expandedChange = new EventEmitter<boolean>();

  userName = '';
  profileImageUrl: string | null = null;
  readonly defaultAvatar = './assets/images/olive.jpg';

  expandedItems: { [key: string]: boolean } = {};
  activeItem: string = 'home';
  activeSubItem: string | null = null;

  // ── Tooltip state ──────────────────────────────────────
  hoveredItem: string | null = null;
  tooltipTop: number = 0;

  // ── Nav data ───────────────────────────────────────────
  // Ordered by daily-use frequency: overview → core operations (orders/products/
  // materials/production) → money (financial/payout) → analytics (AI/reviews) →
  // support & account management last.
  navItems: NavItem[] = [
    {
      key: 'home',
      label: 'Home',
      description: 'Go to dashboard overview',
      route: '/businessowner/bohome',
      icon: 'fa-house',
      submenu: [
        { key: 'dashboard', label: 'Dashboard', route: '/businessowner/bohome' }
      ]
    },
    {
      key: 'orders',
      label: 'Orders',
      description: 'Track and manage all orders',
      route: '/businessowner/materialOrder',
      icon: 'fa-receipt'
    },
    {
      key: 'products',
      label: 'Products',
      description: 'Manage your product catalog',
      route: '/businessowner/ownerProduct',
      icon: 'fa-boxes-stacked',
      submenu: [
        { key: 'all-products', label: 'All Products', route: '/businessowner/ownerProduct' },
        { key: 'add-product', label: 'Add Product', route: '/businessowner/ownerAddProduct' }
      ]
    },
    {
      key: 'raw-material',
      label: 'Raw Material',
      description: 'Browse and purchase materials',
      route: '/businessowner/rawmaterialhome',
      icon: 'fa-cubes',
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
      icon: 'fa-industry'
    },
    {
      key: 'financial',
      label: 'Financial Insights',
      description: 'Revenue, expenses & reports',
      route: '/businessowner/financial',
      icon: 'fa-sack-dollar'
    },
    {
      key: 'Payout',
      label: 'Payout',
      route: '/businessowner/payouthistory',
      description: 'Request and track payout status',
      icon: 'fa-money-bill-transfer'
    },
    {
      key: 'ai-dashboard',
      label: 'AI Insights',
      description: 'AI-driven business analytics & predictions',
      route: '/businessowner/ai-dashboard',
      icon: 'fa-wand-magic-sparkles'
    },
    {
      key: 'review',
      label: 'Review',
      description: 'Customer feedback & ratings',
      route: '/businessowner/reviews',
      icon: 'fa-star'
    },
    {
      key: 'complaints',
      label: 'Complaints',
      description: 'Report violations & track complaints',
      route: '/businessowner/complaints',
      icon: 'fa-flag'
    },
    {
      key: 'knowledge-base',
      label: 'Knowledge Base',
      description: 'Guides, articles & saved bookmarks',
      route: '/businessowner/knowledge-base',
      icon: 'fa-book',
      submenu: [
        { key: 'kb-articles', label: 'Articles', route: '/businessowner/knowledge-base' },
        { key: 'kb-bookmarks', label: 'Bookmarks', route: '/businessowner/knowledge-base/bookmarks' }
      ]
    },
    {
      key: 'support',
      label: 'Support & Services',
      route: '/businessowner/tickets',
      description: 'Help center and tickets',
      icon: 'fa-headset',
      submenu: [
        { key: 'my-tickets', label: 'My Tickets' ,  route: '/businessowner/tickets' },
        { key: 'help-center', label: 'Help Center' , route: '/businessowner/faq'}
      ]
    },
    {
      key: 'settings',
      label: 'Settings',
      description: 'Account, security & preferences',
      route: '/businessowner/settingmain',
      icon: 'fa-gear',
      submenu: [
        { key: 'profile', label: 'Profile Information', route: '/businessowner/settingmain' },
        { key: 'business-details', label: 'Business Details', route: '/businessowner/settingbusinessdetails' },
        { key: 'payment-billing', label: 'Payment & Billing', route: '/businessowner/settingpaymentbilling' },
        { key: 'security-privacy', label: 'Security & Privacy', route: '/businessowner/settingsecurity' },
        { key: 'preferences', label: 'Preferences ', route: '/businessowner/settingpreference' }
      ]
    }
  ];

  // ── Active item derived from the current route ─────────
  // Keeps the active item correct on refresh/direct navigation, not just clicks.
  ngOnInit(): void {
    this.updateActiveFromUrl(this.router.url);
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => this.updateActiveFromUrl(event.urlAfterRedirects));

    this.authService.currentUser$.subscribe(user => {
      this.userName = user ? `${user.firstName} ${user.lastName}`.trim() : '';
    });
    // The top-nav (always mounted alongside this component) triggers the actual
    // profile fetch — this just listens so both stay in sync without a duplicate request.
    this._OwnerSettingService.profileImage$.subscribe(url => {
      this.profileImageUrl = url;
    });
  }

  onAvatarError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = this.defaultAvatar;
  }

  private updateActiveFromUrl(url: string): void {
    const cleanUrl = url.split('?')[0].split('#')[0];

    for (const item of this.navItems) {
      // Check submenu routes first (more specific), but the PARENT's key always
      // drives the always-visible collapsed icon; the submenu key only drives
      // the expanded submenu's own highlight.
      const matchedSub = item.submenu?.find(sub => sub.route && this.isRouteMatch(cleanUrl, sub.route));
      if (matchedSub) {
        this.activeItem = item.key;
        this.activeSubItem = matchedSub.key;
        if (this.isExpanded) {
          this.expandedItems[item.key] = true;
        }
        return;
      }
      if (item.route && this.isRouteMatch(cleanUrl, item.route)) {
        this.activeItem = item.key;
        this.activeSubItem = null;
        return;
      }
    }
  }

  private isRouteMatch(currentUrl: string, itemRoute: string): boolean {
    return currentUrl === itemRoute || currentUrl.startsWith(itemRoute + '/');
  }

  // ── Sidebar toggle ─────────────────────────────────────
  toggleSidebar(): void {
    this.isExpanded = !this.isExpanded;
    this.expandedChange.emit(this.isExpanded);

    if (!this.isExpanded) {
      this.expandedItems = {};
      this.hoveredItem = null; // clear tooltip when collapsing
    } else if (this.activeSubItem) {
      // Re-opening the sidebar should reveal the submenu of whichever section is active
      this.expandedItems[this.activeItem] = true;
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
    this.activeSubItem = null;
  }

  setActiveSub(parentKey: string, subKey: string): void {
    this.activeItem = parentKey;
    this.activeSubItem = subKey;
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