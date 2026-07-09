import { Component, OnInit, signal, viewChild, effect, ElementRef, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpResponse } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';

import { AiAdminService } from '../../../core/services/ai-admin.service'; // adjust path to match your structure
import { AdminSellerDetail } from '../../../core/Interfaces/ai-admin.models'; // adjust path to match your structure

Chart.register(...registerables);

// ── Theme palette (matches the rest of the admin panel) ──
const GOLD = '#B8860B';
const GOLD_PALE = 'rgba(184, 134, 11, 0.12)';
const TEXT_SOFT = '#A09280';
const GRID_LINE = 'rgba(24, 19, 10, 0.06)';

@Component({
  selector: 'app-admin-ai-seller-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-ai-seller-detail.component.html',
  styleUrls: ['./admin-ai-seller-detail.component.css']
})
export class AdminAiSellerDetailComponent implements OnInit {

  loading = signal(true);
  seller = signal<AdminSellerDetail | null>(null);

  // ── Financial export state ──
  exportingFinancial = signal(false);
  exportError = signal<string | null>(null);

  private sellerId: string | null = null;

  // ── Revenue trend chart ──
  readonly revenueTrendCanvas = viewChild<ElementRef<HTMLCanvasElement>>('revenueTrendCanvas');
  private revenueTrendChart?: Chart;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private aiAdminService: AiAdminService
  ) {
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => this.revenueTrendChart?.destroy());

    effect(() => {
      const canvasRef = this.revenueTrendCanvas();
      const points = this.seller()?.revenue_trend;
      if (!canvasRef || !points || points.length === 0) {
        this.revenueTrendChart?.destroy();
        this.revenueTrendChart = undefined;
        return;
      }
      this.renderRevenueTrendChart(canvasRef.nativeElement, points);
    });
  }

  ngOnInit(): void {
    this.sellerId = this.route.snapshot.paramMap.get('sellerId'); // adjust param name to match your route config
    if (!this.sellerId) {
      this.loading.set(false);
      return;
    }

    this.aiAdminService.getSellerDetail(this.sellerId).subscribe({
      next: (result) => {
        this.seller.set(result);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/ai-sellers']); // adjust route path to match your routing setup
  }

  /** "📑 Download Financials" button — matches the guide's per-seller financial export. */
  downloadFinancials(): void {
    if (!this.sellerId || this.exportingFinancial()) return;

    this.exportingFinancial.set(true);
    this.exportError.set(null);

    this.aiAdminService.exportFinancial(this.sellerId).subscribe({
      next: (res: HttpResponse<Blob>) => {
        const fallback = `talentree_bo_${this.sellerId}_financial_report.csv`;
        this.downloadBlob(res, fallback);
        this.exportingFinancial.set(false);
      },
      error: () => {
        this.exportError.set('Failed to export the financial report.');
        this.exportingFinancial.set(false);
      }
    });
  }

  private downloadBlob(response: HttpResponse<Blob>, fallbackName: string): void {
    const disposition = response.headers.get('content-disposition') ?? '';
    const match = /filename\*?=(?:UTF-8'')?"?([^;"\n]+)"?/i.exec(disposition);
    const filename = match ? decodeURIComponent(match[1]) : fallbackName;
    const blob = response.body;
    if (!blob) return;

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }

  riskClass(riskLevel: string): string {
    if (riskLevel.toLowerCase().includes('high')) return 'danger';
    if (riskLevel.toLowerCase().includes('medium')) return 'warn';
    return 'success';
  }

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

  // ─────────────────────── AI badges (Churn Risk / Fraud Score) ───────────────────────
  // Same thresholds used on the Sellers List, for visual consistency with the guide.

  churnRiskPct(score: number): number {
    return score <= 1 ? score * 100 : score;
  }

  churnRiskClass(score: number): string {
    const pct = this.churnRiskPct(score);
    if (pct >= 20) return 'ai-badge-red';
    if (pct >= 5) return 'ai-badge-orange';
    return 'ai-badge-green';
  }

  churnRiskLabel(score: number): string {
    const pct = this.churnRiskPct(score);
    if (pct >= 20) return 'High';
    if (pct >= 5) return 'Med';
    return 'Low';
  }

  fraudScoreClass(score: number): string {
    if (score >= 0.6) return 'ai-badge-red';
    if (score >= 0.3) return 'ai-badge-orange';
    return 'ai-badge-green';
  }

  private renderRevenueTrendChart(canvas: HTMLCanvasElement, points: { month: string; revenue: number }[]): void {
    this.revenueTrendChart?.destroy();
    this.revenueTrendChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: points.map(p => p.month),
        datasets: [{
          label: 'Revenue',
          data: points.map(p => p.revenue),
          borderColor: GOLD,
          backgroundColor: GOLD_PALE,
          borderWidth: 2,
          tension: 0.35,
          fill: true,
          pointRadius: 4,
          pointBackgroundColor: GOLD,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `EGP ${new Intl.NumberFormat('en-US').format(ctx.parsed.y as number)}`
            }
          }
        },
        scales: {
          x: { grid: { color: GRID_LINE }, ticks: { color: TEXT_SOFT } },
          y: {
            grid: { color: GRID_LINE },
            ticks: {
              color: TEXT_SOFT,
              callback: (v) => typeof v === 'number' ? `EGP ${new Intl.NumberFormat('en-US').format(v)}` : v
            }
          }
        }
      }
    });
  }
}