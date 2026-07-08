import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../auth/services/auth.service';
import { AiDashboardService } from '../../core/services/ai-dashboard.service';
import { BenchmarkResponse } from '../../models/ai-tools.model';

@Component({
  selector: 'app-ai-benchmark-panel',
  standalone: true,
  imports: [CommonModule],
  providers: [DecimalPipe],
  template: `
    <div class="panel-card glass-panel benchmark-card">
      <div class="panel-header">
        <div class="title-wrap">
          <span class="icon-glow glow-gold"><i class="fa-solid fa-scale-balanced"></i></span>
          <h3>Platform Benchmark</h3>
        </div>
        <span class="model-tag">vs. all business owners</span>
      </div>

      <div class="panel-body">
        <p class="description">See how your store's performance compares to the platform average.</p>

        <div class="shimmer-loader" *ngIf="loading">
          <div class="shimmer-lines">
            <div class="line w-80"></div>
            <div class="line w-60"></div>
            <div class="line w-70"></div>
          </div>
        </div>

        <div class="bench-rows" *ngIf="benchmark && !loading">
          <div class="bench-row">
            <div class="bench-row__head">
              <span class="bench-label"><i class="fa-solid fa-truck-fast"></i> Fulfillment Speed</span>
              <span class="bench-rank" [ngClass]="rankClass(benchmark.fulfillment_rank_pct)">{{ benchmark.fulfillment_rank }}</span>
            </div>
            <div class="bar-track"><div class="bar-fill" [ngClass]="rankClass(benchmark.fulfillment_rank_pct)" [style.width.%]="benchmark.fulfillment_rank_pct"></div></div>
            <span class="bench-figures">You: {{ benchmark.bo_fulfillment_hours | number:'1.1-1' }}h &nbsp;·&nbsp; Platform avg: {{ benchmark.platform_avg_fulfillment_hours | number:'1.1-1' }}h</span>
          </div>

          <div class="bench-row">
            <div class="bench-row__head">
              <span class="bench-label"><i class="fa-solid fa-medal"></i> Product Quality</span>
              <span class="bench-rank" [ngClass]="rankClass(benchmark.quality_rank_pct)">{{ benchmark.quality_rank }}</span>
            </div>
            <div class="bar-track"><div class="bar-fill" [ngClass]="rankClass(benchmark.quality_rank_pct)" [style.width.%]="benchmark.quality_rank_pct"></div></div>
            <span class="bench-figures">You: {{ benchmark.bo_quality_score | number:'1.2-2' }} &nbsp;·&nbsp; Platform avg: {{ benchmark.platform_avg_quality | number:'1.2-2' }}</span>
          </div>

          <div class="bench-row">
            <div class="bench-row__head">
              <span class="bench-label"><i class="fa-solid fa-star"></i> Customer Rating</span>
              <span class="bench-rank" [ngClass]="rankClass(benchmark.rating_rank_pct)">{{ benchmark.rating_rank }}</span>
            </div>
            <div class="bar-track"><div class="bar-fill" [ngClass]="rankClass(benchmark.rating_rank_pct)" [style.width.%]="benchmark.rating_rank_pct"></div></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .panel-card {
      border-radius: 16px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      box-shadow: var(--bo-shadow-card);
    }
    .glass-panel { background: var(--bo-bg-surface); border: var(--bo-border-surface); backdrop-filter: blur(14px); }
    .panel-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--bo-border-surface-hover); padding-bottom: 12px; }
    .title-wrap { display: flex; align-items: center; gap: 12px; }
    .title-wrap h3 { font-size: 16px; font-weight: 600; color: var(--bo-color-text); margin: 0; }
    .icon-glow { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 8px; font-size: 14px; }
    .glow-gold { background: var(--bo-accent-soft); color: var(--bo-accent); box-shadow: 0 0 10px rgba(218, 165, 32, 0.3); }
    .model-tag { font-size: 10px; background: var(--bo-bg-surface-hover); padding: 4px 8px; border-radius: 12px; color: var(--bo-color-text-muted); border: 1px solid var(--bo-border-surface-hover); }
    .description { font-size: 12.5px; color: var(--bo-color-text-muted); margin: 0; line-height: 1.5; }
    .panel-body { display: flex; flex-direction: column; gap: 16px; }

    .bench-rows { display: flex; flex-direction: column; gap: 18px; }
    .bench-row { display: flex; flex-direction: column; gap: 6px; }
    .bench-row__head { display: flex; justify-content: space-between; align-items: center; }
    .bench-label { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: var(--bo-color-text); }
    .bench-rank { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; padding: 3px 10px; border-radius: 20px; }
    .bench-figures { font-size: 11px; color: var(--bo-color-text-muted); }

    .bar-track { background: var(--bo-bg-surface-hover); height: 8px; border-radius: 4px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 4px; transition: width 0.5s ease; }

    .safe { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
    .warning { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
    .danger { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
    .bar-fill.safe { background: #22c55e; }
    .bar-fill.warning { background: #f59e0b; }
    .bar-fill.danger { background: #ef4444; }

    .shimmer-loader { display: flex; flex-direction: column; gap: 12px; }
    .shimmer-lines { display: flex; flex-direction: column; gap: 8px; width: 100%; }
    .shimmer-lines .line { height: 12px; background: linear-gradient(90deg, var(--bo-bg-surface) 25%, var(--bo-bg-surface-hover) 50%, var(--bo-bg-surface) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite linear; border-radius: 4px; }
    .w-60 { width: 60%; } .w-70 { width: 70%; } .w-80 { width: 80%; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  `]
})
export class AiBenchmarkPanelComponent implements OnInit, OnDestroy {
  private authSvc = inject(AuthService);
  private aiSvc = inject(AiDashboardService);
  private destroy$ = new Subject<void>();

  loading = true;
  benchmark: BenchmarkResponse | null = null;

  ngOnInit(): void {
    this.authSvc.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user?.id) {
          this.loadBenchmark(user.id);
        } else {
          console.error('AI Benchmark: no authenticated business owner id available; skipping data load');
          this.loading = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadBenchmark(userId: string): void {
    this.loading = true;
    this.aiSvc.getBenchmark(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.benchmark = res;
        this.loading = false;
      });
  }

  rankClass(pct: number): string {
    if (pct >= 60) return 'safe';
    if (pct >= 35) return 'warning';
    return 'danger';
  }
}
