import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AiAdminService } from '../../../core/services/ai-admin.service'; // adjust path to match your structure
import { AdminSellerListItem } from '../../../core/Interfaces/ai-admin.models'; // adjust path to match your structure

@Component({
  selector: 'app-admin-ai-sellers-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-ai-sellers-list.component.html',
  styleUrls: ['./admin-ai-sellers-list.component.css']
})
export class AdminAiSellersListComponent implements OnInit {

  loading = signal(true);
  sellers = signal<AdminSellerListItem[]>([]);

  constructor(
    private aiAdminService: AiAdminService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.aiAdminService.getSellers('risk').subscribe({
      next: (results) => {
        this.sellers.set(results);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openSeller(sellerId: string): void {
    this.router.navigate(['/admin/ai-sellers', sellerId]); // adjust route path to match your routing setup
  }

  riskClass(riskLevel: string): string {
    if (riskLevel.toLowerCase().includes('high')) return 'danger';
    if (riskLevel.toLowerCase().includes('medium')) return 'warn';
    return 'success';
  }

  // approval_status mapping inferred from cross-referencing dashboard alerts data.
  // Confirm with backend if other status values exist (e.g. rejected/suspended).
  approvalLabel(status: number): string {
    if (status === 1) return 'Pending';
    if (status === 2) return 'Approved';
    return 'Unknown';
  }

  approvalClass(status: number): string {
    if (status === 1) return 'warn';
    if (status === 2) return 'success';
    return 'warn';
  }

  initials(name: string): string {
    if (!name) return '?';
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }

  // ─────────────────────── AI badges (churn / fraud / profile %) ───────────────────────
  // NOTE: assumes AdminSellerListItem carries churn_risk_score, fraud_score and
  // profile_completeness (0-1 or 0-100 as returned by the AI service). Adjust the
  // field names below if your interface names them differently.

  churnRiskPct(seller: AdminSellerListItem): number {
    const raw = (seller as any).churn_risk_score ?? 0;
    return raw <= 1 ? raw * 100 : raw;
  }

  churnRiskClass(seller: AdminSellerListItem): string {
    const pct = this.churnRiskPct(seller);
    if (pct >= 20) return 'ai-badge-red';
    if (pct >= 5) return 'ai-badge-orange';
    return 'ai-badge-green';
  }

  churnRiskLabel(seller: AdminSellerListItem): string {
    const pct = this.churnRiskPct(seller);
    if (pct >= 20) return 'High';
    if (pct >= 5) return 'Med';
    return 'Low';
  }

  churnRiskIcon(seller: AdminSellerListItem): string {
    const pct = this.churnRiskPct(seller);
    if (pct >= 20) return '🔴';
    if (pct >= 5) return '🟠';
    return '🟢';
  }

  fraudScore(seller: AdminSellerListItem): number {
    return (seller as any).fraud_score ?? 0;
  }

  fraudScoreClass(seller: AdminSellerListItem): string {
    const score = this.fraudScore(seller);
    if (score >= 0.6) return 'ai-badge-red';
    if (score >= 0.3) return 'ai-badge-orange';
    return 'ai-badge-green';
  }

  profileCompletenessPct(seller: AdminSellerListItem): number {
    const raw = (seller as any).profile_completeness ?? 0;
    return raw <= 1 ? Math.round(raw * 100) : Math.round(raw);
  }

  profileBarColorClass(seller: AdminSellerListItem): string {
    const pct = this.profileCompletenessPct(seller);
    if (pct >= 100) return 'bar-green';
    if (pct >= 60) return 'bar-orange';
    return 'bar-red';
  }
}