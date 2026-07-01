import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../modules/auth/services/auth.service';

export interface SubmenuItem {
  key: string;
  label: string;
  route: string;
}

export interface NavItem {
  key: string;
  label: string;
  description: string;
  route?: string;
  icon: string;
  badge?: number;
  badgeColor?: 'warn' | 'danger' | 'info';
  submenu?: SubmenuItem[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-admin-side-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.css'
})
export class AdminSideNavComponent implements OnInit {
  isExpanded: boolean = false;
  @Output() expandedChange = new EventEmitter<boolean>();

  activeItem: string = 'dashboard';
  hoveredItem: string | null = null;
  tooltipTop: number = 0;

  navSections: NavSection[] = [
    {
      title: 'Dashboard',
      items: [
        {
          key: 'dashboard',
          label: 'Dashboard',
          description: 'Admin overview & quick actions',
          route: '/admin/dashboard',
          icon: `M3 3h7v7H3zm0 11h7v7H3zm11-11h7v7h-7zm0 11h7v7h-7z`
        }
      ]
    },
    {
      title: 'User Management',
      items: [
        {
          key: 'pendingbo',
          label: 'Business Owners',
          description: 'Review and approve owner requests',
          route: '/admin/pendingbo',
          badge: 12,
          badgeColor: 'warn',
          icon: `M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8m14 14v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75`
        },
        {
          key: 'adminlist',
          label: 'Admins',
          description: 'Manage administrator accounts',
          route: '/admin/adminlist',
          icon: `M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z`
        },
        {
          key: 'user-management',
          label: 'User Management',
          description: 'Manage customers and account states',
          route: '/admin/user-management',
          icon: `M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z`
        }
      ]
    },
    {
      title: 'Product Management',
      items: [
        {
          key: 'products',
          label: 'All Products',
          description: 'Review and manage product catalog',
          route: '/admin/producthome',
          badge: 8,
          badgeColor: 'warn',
          icon: `M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0`
        },
        {
          key: 'production-requests',
          label: 'Production Requests',
          description: 'Review requests to start manufacture',
          route: '/admin/production-requests',
          icon: `M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25M6.72 6.72a.75.75 0 0 1 1.06 0L12 10.94l4.22-4.22a.75.75 0 1 1 1.06 1.06L13.06 12l4.22 4.22a.75.75 0 1 1-1.06 1.06L12 13.06l-4.22 4.22a.75.75 0 0 1-1.06-1.06L10.94 12 6.72 7.78a.75.75 0 0 1 0-1.06Z`
        },
        {
          key: 'rawmaterials',
          label: 'Raw Materials',
          description: 'Manage platform raw materials directory',
          route: '/admin/rawmaterials',
          icon: `M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96 12 12.01l8.73-5.05M12 22.08V12`
        },
        {
          key: 'suppliers',
          label: 'Suppliers Directory',
          description: 'View registered supply chain organizations',
          route: '/admin/suppliers',
          icon: `M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772`
        }
      ]
    },
    {
      title: 'Operations',
      items: [
        {
          key: 'auto-blocks',
          label: 'Auto-Blocks',
          description: 'Automated restriction approvals',
          route: '/admin/auto-blocks',
          icon: `M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z`
        }
      ]
    },
    {
      title: 'Orders & Transactions',
      items: [
        {
          key: 'orders',
          label: 'Orders',
          description: 'Manage and monitor all customer orders',
          route: '/admin/orders',
          icon: `M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z`
        },
        {
          key: 'refunds',
          label: 'Refunds',
          description: 'Review and manage customer refunds',
          route: '/admin/refunds',
          icon: `M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3`
        },
        {
          key: 'transactions',
          label: 'Transactions',
          description: 'Monitor and manage financial transactions',
          route: '/admin/transactions',
          icon: `M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15`
        }
      ]
    },
    {
      title: 'Support & Complaints',
      items: [
        {
          key: 'support',
          label: 'Complaints & Support',
          description: 'Helpdesk and ticketing actions',
          route: '/admin/adminsupportcomplaint',
          icon: `M12 20.25c4.556 0 8.25-3.694 8.25-8.25S16.556 3.75 12 3.75 3.75 7.444 3.75 12s3.694 8.25 8.25 8.25Z M8.25 12h.008v.008H8.25V12Zm4 0h.008v.008H12V12Zm4 0h.008v.008H16V12Z`
        },
        {
          key: 'interactions',
          label: 'Interactions History',
          description: 'View customer security audit events',
          route: '/admin/interactions',
          icon: `M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 1.137-.089l4.023-5.631Z`
        }
      ]
    },
    {
      title: 'Knowledge Base',
      items: [
        {
          key: 'knowledge',
          label: 'Knowledge Base',
          description: 'Manage help articles and guides',
          route: '/admin/knowledge',
          icon: `M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25`
        }
      ]
    },
    {
      title: 'Platform Settings',
      items: [
        {
          key: 'platform-homepage',
          label: 'Homepage Design',
          description: 'Configure hero banners and announcements',
          route: '/admin/platform/homepage',
          icon: `M2.25 12a9.75 9.75 0 1 1 19.5 0 9.75 9.75 0 0 1-19.5 0Z M12 8.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Z`
        },
        {
          key: 'platform-categories',
          label: 'Category Catalog',
          description: 'Configure hierarchical product categories',
          route: '/admin/platform/categories',
          icon: `M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25A2.25 2.25 0 0 1 13.5 8.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z`
        },
        {
          key: 'platform-commission',
          label: 'Commission Rules',
          description: 'Configure standard and category commission rates',
          route: '/admin/platform/commission',
          icon: `M12 6v12m-3-2.818.879.11A1.13 1.13 0 0 1 12 12.44V12.44m0-4.88V6m0 12v.5m0-12.5V3m0 12a3 3 0 1 1-3-3m3 3h3a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3m0 0V3m0 3H9`
        },
        {
          key: 'platform-policies',
          label: 'Legal Policies',
          description: 'Draft and publish system terms and policies',
          route: '/admin/platform/policies',
          icon: `M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z`
        },
        {
          key: 'platform-shipping',
          label: 'Shipping & Tax Settings',
          description: 'Configure standard rates and defaults',
          route: '/admin/platform/shipping-tax',
          icon: `M8.25 18.75a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM19.5 18.75a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z M2.25 3.75h1.5m1.5 0h11.375m0 0L19.5 12h-12M19.5 12v3.75m0 0H7.5m12 0L21 12`
        }
      ]
    }
  ];

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.router.events.subscribe(() => {
      this.updateActiveItem();
    });
    this.updateActiveItem();
  }

  updateActiveItem(): void {
    const url = this.router.url;
    for (const section of this.navSections) {
      for (const item of section.items) {
        if (item.route && url.startsWith(item.route)) {
          this.activeItem = item.key;
          return;
        }
      }
    }
  }

  toggleSidebar(): void {
    this.isExpanded = !this.isExpanded;
    this.expandedChange.emit(this.isExpanded);
    if (!this.isExpanded) {
      this.hoveredItem = null;
    }
  }

  setActive(key: string): void {
    this.activeItem = key;
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

  signOut(): void {
    this.authService.logout().subscribe({
      next: () => console.log('✅ Logged out'),
      error: (err) => console.warn('⚠️ Logout error:', err)
    });
  }
}
