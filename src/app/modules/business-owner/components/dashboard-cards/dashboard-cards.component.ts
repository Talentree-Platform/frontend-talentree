import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, DecimalPipe, CurrencyPipe } from '@angular/common';
import { AiDashboardOverview } from '../../models/dashboard.model';

@Component({
  selector: 'app-dashboard-cards',
  standalone: true,
  imports: [CommonModule],
  providers: [DecimalPipe, CurrencyPipe],
  template: `
    <div class="kpi-grid">
      @if (loading) {
        @for (i of [1,2,3,4,5,6,7,8,9,10,11,12,13]; track i) {
          <div class="kpi-card skeleton-card">
            <div class="skeleton-title"></div>
            <div class="skeleton-value"></div>
            <div class="skeleton-sub"></div>
          </div>
        }
      } @else if (overview) {
        <!-- Total Revenue -->
        <div class="kpi-card glass-card">
          <div class="card-header">
            <span class="label">Total Revenue</span>
            <span class="icon-wrap"><i class="fa-solid fa-wallet"></i></span>
          </div>
          <div class="value highlight-gold">
            {{ animatedRevenue | currency:'USD':'symbol':'1.2-2' }}
          </div>
          <div class="trend-indicator {{ getTrendClass(overview.revenue_trend) }}">
            <i class="fa-solid" [ngClass]="getTrendIcon(overview.revenue_trend)"></i>
            {{ overview.revenue_trend }}
          </div>
        </div>

        <!-- Revenue Last 30 Days -->
        <div class="kpi-card glass-card">
          <div class="card-header">
            <span class="label">Revenue (Last 30 Days)</span>
            <span class="icon-wrap"><i class="fa-solid fa-calendar-days"></i></span>
          </div>
          <div class="value">
            {{ overview.revenue_last_30d | currency:'USD':'symbol':'1.2-2' }}
          </div>
          <div class="subtext">Previous 30 Days trend</div>
        </div>

        <!-- Total Orders -->
        <div class="kpi-card glass-card">
          <div class="card-header">
            <span class="label">Total Orders</span>
            <span class="icon-wrap"><i class="fa-solid fa-box"></i></span>
          </div>
          <div class="value animated-count">
            {{ animatedOrders }}
          </div>
          <div class="subtext">Fulfillment in progress</div>
        </div>

        <!-- Average Fulfillment Time -->
        <div class="kpi-card glass-card">
          <div class="card-header">
            <span class="label">Avg Fulfillment Time</span>
            <span class="icon-wrap"><i class="fa-solid fa-clock"></i></span>
          </div>
          <div class="value">
            @if (overview.avg_fulfillment_hours < 0) {
              <span class="muted-value">Data unavailable</span>
            } @else {
              {{ overview.avg_fulfillment_hours | number:'1.1-1' }} <span class="unit">hrs</span>
            }
          </div>
          <div class="subtext">Order dispatch latency</div>
        </div>

        <!-- Churn Risk Score (Circular Progress) -->
        <div class="kpi-card glass-card churn-risk-card">
          <div class="card-header">
            <span class="label">Customer Churn Risk</span>
            <span class="icon-wrap"><i class="fa-solid fa-user-slash"></i></span>
          </div>
          <div class="circular-progress-container">
            <svg viewBox="0 0 36 36" class="circular-chart {{ getChurnRiskColorClass(overview.churn_risk_score) }}">
              <path class="circle-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path class="circle"
                [attr.stroke-dasharray]="(overview.churn_risk_score * 100) + ', 100'"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <text x="18" y="20.35" class="percentage">{{ Math.round(overview.churn_risk_score * 100) }}%</text>
            </svg>
            <div class="risk-label-wrap">
              <span class="risk-level">{{ getChurnRiskLabel(overview.churn_risk_score) }}</span>
              <span class="subtext">Churn likelihood</span>
            </div>
          </div>
        </div>

        <!-- Profile Completeness (Progress Bar) -->
        <div class="kpi-card glass-card span-two-mobile">
          <div class="card-header">
            <span class="label">Profile Completeness</span>
            <span class="icon-wrap"><i class="fa-solid fa-id-card"></i></span>
          </div>
          <div class="progress-bar-section">
            <div class="bar-header">
              <span class="pct">{{ overview.profile_completeness_pct }}% Completed</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" [style.width.%]="overview.profile_completeness_pct"></div>
            </div>
            <div class="subtext">Keep details updated for higher search rank</div>
          </div>
        </div>

        <!-- Fraud Alerts -->
        <div class="kpi-card glass-card {{ overview.fraud_alerts > 0 ? 'border-danger' : '' }}">
          <div class="card-header">
            <span class="label">Fraud Alerts</span>
            <span class="icon-wrap"><i class="fa-solid fa-triangle-exclamation"></i></span>
          </div>
          <div class="value" [ngClass]="{'color-danger': overview.fraud_alerts > 0}">
            {{ overview.fraud_alerts }}
          </div>
          <div class="subtext">{{ overview.fraud_alerts > 0 ? 'Requires immediate action' : 'All transactions secure' }}</div>
        </div>

        <!-- Low Stock Products -->
        <div class="kpi-card glass-card {{ overview.low_stock_count > 0 ? 'border-warning' : '' }}">
          <div class="card-header">
            <span class="label">Low Stock Products</span>
            <span class="icon-wrap"><i class="fa-solid fa-cubes-stacked"></i></span>
          </div>
          <div class="value" [ngClass]="{'color-warning': overview.low_stock_count > 0}">
            {{ overview.low_stock_count }}
          </div>
          <div class="subtext">{{ overview.low_stock_count > 0 ? 'Restock recommended' : 'Healthy inventory level' }}</div>
        </div>

        <!-- Product Quality Score -->
        <div class="kpi-card glass-card">
          <div class="card-header">
            <span class="label">Product Quality Score</span>
            <span class="icon-wrap"><i class="fa-solid fa-award"></i></span>
          </div>
          <div class="value">
            {{ overview.avg_product_quality_score | number:'1.1-1' }} <span class="out-of">/ 5.0</span>
          </div>
          <div class="subtext">Based on returns & reports</div>
        </div>

        <!-- Review Sentiment -->
        <div class="kpi-card glass-card">
          <div class="card-header">
            <span class="label">Review Sentiment</span>
            <span class="icon-wrap"><i class="fa-solid fa-face-smile"></i></span>
          </div>
          <div class="sentiment-indicator">
            <div class="value highlight-gold">
              {{ Math.round((overview.avg_review_sentiment + 1) * 50) }}%
            </div>
            <div class="sentiment-bar">
              <div class="sentiment-bar-fill" [style.left.%]="50" [style.width.%]="overview.avg_review_sentiment * 50" [ngClass]="{'negative': overview.avg_review_sentiment < 0}"></div>
            </div>
          </div>
          <div class="subtext">Net sentiment score ({{ overview.avg_review_sentiment >= 0 ? '+' : '' }}{{ overview.avg_review_sentiment | number:'1.2-2' }})</div>
        </div>

        <!-- Negative Reviews -->
        <div class="kpi-card glass-card">
          <div class="card-header">
            <span class="label">Negative Reviews</span>
            <span class="icon-wrap"><i class="fa-solid fa-thumbs-down"></i></span>
          </div>
          <div class="value" [ngClass]="{'color-danger': overview.negative_reviews_count > 0}">
            {{ overview.negative_reviews_count }}
          </div>
          <div class="subtext">Needs owner responses</div>
        </div>

        <!-- Open Support Tickets -->
        <div class="kpi-card glass-card">
          <div class="card-header">
            <span class="label">Open Support Tickets</span>
            <span class="icon-wrap"><i class="fa-solid fa-headset"></i></span>
          </div>
          <div class="value">
            {{ overview.open_support_tickets }}
          </div>
          <div class="subtext">Customer requests pending</div>
        </div>
      } @else {
        <div class="empty-kpis">
          <p>No KPI data available.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }
    
    .kpi-card {
      position: relative;
      padding: 24px;
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 12px;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      min-height: 140px;
    }

    .glass-card {
      background: var(--bg-card);
      border: var(--border-card);
      backdrop-filter: blur(14px);
    }

    .glass-card:hover {
      transform: translateY(-4px);
      border-color: var(--border-card-hover);
      box-shadow: var(--shadow-card-hover);
    }

    .border-danger {
      border-color: rgba(239, 68, 110, 0.4) !important;
    }
    
    .border-warning {
      border-color: rgba(245, 158, 11, 0.4) !important;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .label {
      font-size: 13px;
      font-weight: 500;
      color: var(--color-card-title);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .icon-wrap {
      color: var(--color-eyebrow);
      font-size: 16px;
      opacity: 0.8;
    }

    .value {
      font-size: 28px;
      font-weight: 700;
      color: var(--color-card-value);
      font-family: 'DM Sans', sans-serif;
    }

    .highlight-gold {
      background: var(--color-highlight-gold);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 800;
    }

    .unit {
      font-size: 14px;
      font-weight: 500;
      color: var(--color-card-sub);
    }

    .out-of {
      font-size: 16px;
      font-weight: 500;
      color: var(--color-card-sub);
    }

    .muted-value {
      font-size: 18px;
      font-weight: 500;
      color: var(--color-card-sub);
    }

    .subtext {
      font-size: 11px;
      color: var(--color-card-sub);
      font-weight: 400;
    }

    .color-danger {
      color: #ef4444 !important;
    }

    .color-warning {
      color: #f59e0b !important;
    }

    /* Trend direction indicators */
    .trend-indicator {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 20px;
      align-self: flex-start;
    }
    
    .trend-rising {
      background: rgba(34, 197, 94, 0.12);
      color: #22c55e;
    }
    
    .trend-stable {
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.7);
    }
    
    .trend-falling {
      background: rgba(239, 68, 68, 0.12);
      color: #ef4444;
    }

    /* Churn Risk card layout */
    .churn-risk-card {
      min-height: 160px;
    }

    .circular-progress-container {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .circular-chart {
      display: block;
      width: 60px;
      height: 60px;
    }

    .circle-bg {
      fill: none;
      stroke: var(--bg-circle-bg);
      stroke-width: 2.8;
    }

    .circle {
      fill: none;
      stroke-width: 2.8;
      stroke-linecap: round;
      transition: stroke-dasharray 0.3s ease;
    }

    .chart-low .circle {
      stroke: #22c55e;
    }

    .chart-medium .circle {
      stroke: #f59e0b;
    }

    .chart-high .circle {
      stroke: #ef4444;
    }

    .percentage {
      fill: var(--color-circle-text);
      font-family: sans-serif;
      font-size: 9px;
      font-weight: 700;
      text-anchor: middle;
    }

    .risk-label-wrap {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .risk-level {
      font-size: 15px;
      font-weight: 700;
      color: var(--color-card-value);
    }

    /* Progress bar styling */
    .progress-bar-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .bar-header {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      font-weight: 600;
      color: var(--color-card-value);
    }

    .progress-track {
      background: var(--bg-progress-track);
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
      width: 100%;
    }

    .progress-fill {
      background: var(--bg-progress-fill);
      height: 100%;
      border-radius: 4px;
      transition: width 1s ease-out;
    }

    /* Sentiment section styling */
    .sentiment-indicator {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .sentiment-bar {
      position: relative;
      background: var(--bg-progress-track);
      height: 6px;
      border-radius: 3px;
      overflow: hidden;
    }

    .sentiment-bar-fill {
      position: absolute;
      background: #22c55e;
      height: 100%;
      border-radius: 3px;
      transition: width 0.3s ease;
    }

    .sentiment-bar-fill.negative {
      transform: translateX(-100%);
      background: #ef4444;
    }

    /* Skeleton placeholders */
    .skeleton-card {
      background: var(--bg-skeleton-card);
      border: var(--border-skeleton-card);
    }
    
    .skeleton-title, .skeleton-value, .skeleton-sub {
      background: var(--bg-shimmer);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite linear;
      border-radius: 4px;
    }

    .skeleton-title {
      width: 60%;
      height: 12px;
    }

    .skeleton-value {
      width: 45%;
      height: 28px;
      margin-top: 10px;
    }

    .skeleton-sub {
      width: 70%;
      height: 10px;
      margin-top: 6px;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .empty-kpis {
      grid-column: 1 / -1;
      padding: 40px;
      text-align: center;
      background: var(--bg-empty-kpis);
      border-radius: 16px;
      color: var(--color-card-sub);
    }

    @media (max-width: 576px) {
      .span-two-mobile {
        grid-column: span 2;
      }
    }
  `],
})
export class DashboardCardsComponent implements OnChanges {
  @Input() overview: AiDashboardOverview | null = null;
  @Input() loading = false;

  Math = Math;

  animatedRevenue = 0;
  animatedOrders = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['overview'] && this.overview) {
      this.animateKPIs();
    }
  }

  private animateKPIs(): void {
    if (!this.overview) return;
    
    // Reset values
    this.animatedRevenue = 0;
    this.animatedOrders = 0;

    const revTarget = this.overview.revenue_total;
    const ordersTarget = this.overview.total_orders;

    const duration = 1200; // ms
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing out quadratic
      const ease = progress * (2 - progress);

      this.animatedRevenue = ease * revTarget;
      this.animatedOrders = Math.round(ease * ordersTarget);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        this.animatedRevenue = revTarget;
        this.animatedOrders = ordersTarget;
      }
    };

    requestAnimationFrame(step);
  }

  getTrendClass(trend: string): string {
    if (!trend) return 'trend-stable';
    const t = trend.toLowerCase();
    if (t.includes('ris') || t.includes('up') || t.includes('grow')) return 'trend-rising';
    if (t.includes('fall') || t.includes('down') || t.includes('decline')) return 'trend-falling';
    return 'trend-stable';
  }

  getTrendIcon(trend: string): string {
    if (!trend) return 'fa-minus';
    const t = trend.toLowerCase();
    if (t.includes('ris') || t.includes('up') || t.includes('grow')) return 'fa-arrow-trend-up';
    if (t.includes('fall') || t.includes('down') || t.includes('decline')) return 'fa-arrow-trend-down';
    return 'fa-minus';
  }

  getChurnRiskColorClass(score: number): string {
    if (score < 0.3) return 'chart-low';
    if (score < 0.6) return 'chart-medium';
    return 'chart-high';
  }

  getChurnRiskLabel(score: number): string {
    if (score < 0.3) return 'Low Risk';
    if (score < 0.6) return 'Medium Risk';
    return 'High Risk';
  }
}
