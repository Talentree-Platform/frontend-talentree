import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { KbRecommendationsComponent } from '../../components/kb-recommendations/kb-recommendations.component';
import { FinancialService } from '../../core/services/financial.service';
import { FinancialSummary } from '../../core/services/financial.models';

interface QuickLink {
  label: string;
  description: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-business-owner-home',
  standalone: true,
  imports: [CommonModule, RouterLink, KbRecommendationsComponent],
  templateUrl: './business-owner-home.component.html',
  styleUrls: ['./business-owner-home.component.css'],
})
export class BusinessOwnerHomeComponent implements OnInit, OnDestroy {
  summary: FinancialSummary | null = null;
  loading = true;

  // Quick-access shortcuts to the module's main features, mirrors the side-nav's routes.
  quickLinks: QuickLink[] = [
    { label: 'Products',        description: 'Manage your product catalog',        route: '/businessowner/ownerProduct',              icon: 'fa-boxes-stacked' },
    { label: 'Add Product',     description: 'List a new product for sale',        route: '/businessowner/ownerAddProduct',           icon: 'fa-circle-plus' },
    { label: 'Orders',          description: 'Track and manage all orders',        route: '/businessowner/materialOrder',             icon: 'fa-receipt' },
    { label: 'Raw Materials',   description: 'Browse and purchase materials',      route: '/businessowner/rawmaterialhome',           icon: 'fa-cubes' },
    { label: 'Production',      description: 'Industry production requests',      route: '/businessowner/ownerProductionRequestList', icon: 'fa-industry' },
    { label: 'Financial',       description: 'Revenue, expenses & reports',        route: '/businessowner/financial',                 icon: 'fa-sack-dollar' },
    { label: 'Payout',          description: 'Request and track payout status',    route: '/businessowner/payouthistory',             icon: 'fa-money-bill-transfer' },
    { label: 'AI Insights',     description: 'AI-driven business analytics',       route: '/businessowner/ai-dashboard',              icon: 'fa-wand-magic-sparkles' },
    { label: 'Reviews',         description: 'Customer feedback & ratings',        route: '/businessowner/reviews',                   icon: 'fa-star' },
    { label: 'Support',         description: 'Help center and tickets',            route: '/businessowner/tickets',                   icon: 'fa-headset' },
    { label: 'Settings',        description: 'Account, security & preferences',    route: '/businessowner/settingmain',               icon: 'fa-gear' },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private financialService: FinancialService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.financialService
      .getSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:  (data) => { this.summary = data; this.loading = false; },
        error: ()     => { this.loading = false; },
      });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  goToFinancial(): void { this.router.navigate(['/businessowner/financial']); }
}