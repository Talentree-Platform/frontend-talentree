import { Component, computed, signal, viewChild, effect, ElementRef, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import { AiAdminService } from '../../../core/services/ai-admin.service';
import {
  AdminAnalyticsResponse,
  AdminForecastResponse,
  AdminCustomerInsightsResponse,
  AdminRfmSegmentsResponse,
  AdminCategoryPerformance,
  AdminPriceAnomaliesResponse,
  CategoryTrendPoint,
  AdminCategoryForecastResponse,
  CategoryForecastSkipped,
  CategoryForecastItem,
  CategoryForecastPoint
} from '../../../core/Interfaces/ai-admin.models';

Chart.register(...registerables);

// ── Theme palette (matches the Gold/Cream admin theme) ──
const GOLD = '#B8860B';
const GOLD_LIGHT = '#C9952A';
const GOLD_PALE = 'rgba(184, 134, 11, 0.12)';
const GREEN = '#27A06B';
const BLUE = '#3B6FE8';
const RED = '#D94040';
const AMBER = '#C9952A';
const TEXT_SOFT = '#A09280';
const GRID_LINE = 'rgba(24, 19, 10, 0.06)';

// Cycled palette for multi-series charts (RFM segments, category bars, etc.)
const PALETTE = [GOLD, GREEN, BLUE, RED, AMBER, '#7C5CBF'];

type InsightTabKey = 'analytics' | 'forecast' | 'customers' | 'rfm' | 'categories' | 'anomalies';

interface InsightTab {
  key: InsightTabKey;
  label: string;
}

interface ForecastChartPoint {
  label: string;
  value: number;
  isForecast: boolean;
}

interface CustomerRow {
  customer_id: number | string;
  name: string;
  email: string;
  orders_count?: number;
  lifetime_value: number;
  avg_order_value?: number;
  days_since_last: number;
  segment: 'high_value' | 'inactive';
}

@Component({
  selector: 'app-admin-ai-insights',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-ai-insights.component.html',
  styleUrl: './admin-ai-insights.component.css'
})
export class AdminAiInsightsComponent {
  readonly tabs: InsightTab[] = [
    { key: 'analytics', label: 'Analytics' },
    { key: 'forecast', label: 'Forecast' },
    { key: 'customers', label: 'Customers' },
    { key: 'rfm', label: 'RFM segments' },
    { key: 'categories', label: 'Categories' },
    { key: 'anomalies', label: 'Price anomalies' }
  ];

  activeTab = signal<InsightTabKey>('analytics');
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  private loadedTabs = new Set<InsightTabKey>();

  analytics = signal<AdminAnalyticsResponse | null>(null);
  forecast = signal<AdminForecastResponse | null>(null);
  customers = signal<AdminCustomerInsightsResponse | null>(null);
  rfm = signal<AdminRfmSegmentsResponse | null>(null);
  categories = signal<AdminCategoryPerformance[]>([]);
  anomalies = signal<AdminPriceAnomaliesResponse | null>(null);

  // ── Category forecast (loaded alongside the categories tab) ──
  categoryForecast = signal<AdminCategoryForecastResponse | null>(null);

  // ── Category trend drill-down state ──
  expandedCategoryId = signal<number | null>(null);
  categoryTrends = signal<Record<number, CategoryTrendPoint[]>>({});
  categoryTrendLoading = signal<number | null>(null);
  categoryTrendError = signal<number | null>(null);

  forecastChartPoints = computed<ForecastChartPoint[]>(() => {
    const data = this.forecast();
    if (!data) return [];
    const actuals = data.actuals.map(a => ({ label: a.month, value: a.revenue, isForecast: false }));
    const predicted = data.forecast.map(f => ({ label: f.month, value: f.forecasted_revenue, isForecast: true }));
    return [...actuals, ...predicted];
  });

  maxForecastValue = computed(() => {
    return this.forecastChartPoints().reduce((max, p) => Math.max(max, p.value), 0) || 1;
  });

  rfmEntries = computed<{ segment: string; count: number }[]>(() => {
    const dist = this.rfm()?.distribution ?? {};
    return Object.entries(dist).map(([segment, count]) => ({ segment, count }));
  });

  maxRfmCount = computed(() => {
    return this.rfmEntries().reduce((max, e) => Math.max(max, e.count), 0) || 1;
  });

  /** Merges high-value + inactive customer segments into a single tagged list for the Customers table. */
  customerRows = computed<CustomerRow[]>(() => {
    const data = this.customers();
    if (!data) return [];
    const highValue: CustomerRow[] = data.high_value_segments.map(c => ({ ...c, segment: 'high_value' }));
    const inactive: CustomerRow[] = data.inactive_90d_segments.map(c => ({ ...c, segment: 'inactive' }));
    return [...highValue, ...inactive];
  });

  // ── Chart.js canvas refs (each only exists in the DOM while its tab is active) ──
  readonly revenueTrendCanvas = viewChild<ElementRef<HTMLCanvasElement>>('revenueTrendCanvas');
  readonly userGrowthCanvas = viewChild<ElementRef<HTMLCanvasElement>>('userGrowthCanvas');
  readonly orderVolumeCanvas = viewChild<ElementRef<HTMLCanvasElement>>('orderVolumeCanvas');
  readonly categoryDistributionCanvas = viewChild<ElementRef<HTMLCanvasElement>>('categoryDistributionCanvas');
  readonly forecastCanvas = viewChild<ElementRef<HTMLCanvasElement>>('forecastCanvas');
  readonly rfmCanvas = viewChild<ElementRef<HTMLCanvasElement>>('rfmCanvas');
  readonly categoryForecastCanvas = viewChild<ElementRef<HTMLCanvasElement>>('categoryForecastCanvas');
  readonly categoryTrendCanvas = viewChild<ElementRef<HTMLCanvasElement>>('categoryTrendCanvasRef');

  private revenueTrendChart?: Chart;
  private userGrowthChart?: Chart;
  private orderVolumeChart?: Chart;
  private categoryDistributionChart?: Chart;
  private forecastChart?: Chart;
  private rfmChart?: Chart;
  private categoryForecastChart?: Chart;
  private categoryTrendChart?: Chart;

  constructor(private aiAdminService: AiAdminService) {
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => {
      this.revenueTrendChart?.destroy();
      this.userGrowthChart?.destroy();
      this.orderVolumeChart?.destroy();
      this.categoryDistributionChart?.destroy();
      this.forecastChart?.destroy();
      this.rfmChart?.destroy();
      this.categoryForecastChart?.destroy();
      this.categoryTrendChart?.destroy();
    });

    this.selectTab('analytics');

    // Net revenue by period (bar chart)
    effect(() => {
      const canvasRef = this.revenueTrendCanvas();
      const data = this.analytics();
      if (!canvasRef || !data) {
        this.revenueTrendChart?.destroy();
        this.revenueTrendChart = undefined;
        return;
      }
      this.renderRevenueTrendChart(canvasRef.nativeElement, data.revenue_trend);
    });

    // User growth: new sellers vs new customers (grouped bar chart)
    effect(() => {
      const canvasRef = this.userGrowthCanvas();
      const data = this.analytics();
      if (!canvasRef || !data) {
        this.userGrowthChart?.destroy();
        this.userGrowthChart = undefined;
        return;
      }
      this.renderUserGrowthChart(canvasRef.nativeElement, data.user_growth);
    });

    // Order volume: total / delivered / cancelled (grouped bar chart)
    effect(() => {
      const canvasRef = this.orderVolumeCanvas();
      const data = this.analytics();
      if (!canvasRef || !data) {
        this.orderVolumeChart?.destroy();
        this.orderVolumeChart = undefined;
        return;
      }
      this.renderOrderVolumeChart(canvasRef.nativeElement, data.order_volume);
    });

    // Category distribution: purchases by category (horizontal bar chart)
    effect(() => {
      const canvasRef = this.categoryDistributionCanvas();
      const data = this.analytics();
      if (!canvasRef || !data) {
        this.categoryDistributionChart?.destroy();
        this.categoryDistributionChart = undefined;
        return;
      }
      this.renderCategoryDistributionChart(canvasRef.nativeElement, data.category_distribution);
    });

    // Revenue: actual vs forecast (line chart)
    effect(() => {
      const canvasRef = this.forecastCanvas();
      const data = this.forecast();
      if (!canvasRef || !data) {
        this.forecastChart?.destroy();
        this.forecastChart = undefined;
        return;
      }
      this.renderForecastChart(canvasRef.nativeElement, data);
    });

    // RFM segments (donut chart)
    effect(() => {
      const canvasRef = this.rfmCanvas();
      const entries = this.rfmEntries();
      if (!canvasRef || entries.length === 0) {
        this.rfmChart?.destroy();
        this.rfmChart = undefined;
        return;
      }
      this.renderRfmChart(canvasRef.nativeElement, entries);
    });

    // Category demand forecast — multi-line time-series chart
    effect(() => {
      const canvasRef = this.categoryForecastCanvas();
      const fc = this.categoryForecast();
      if (!canvasRef || !fc || this.isCategoryForecastSkipped(fc)) {
        this.categoryForecastChart?.destroy();
        this.categoryForecastChart = undefined;
        return;
      }
      this.renderCategoryForecastChart(canvasRef.nativeElement, fc.forecasts);
    });

    // Category revenue trend sparkline (only one row can be expanded at a time)
    effect(() => {
      const canvasRef = this.categoryTrendCanvas();
      const catId = this.expandedCategoryId();
      const points = catId !== null ? this.categoryTrends()[catId] : undefined;
      const isLoading = this.categoryTrendLoading() === catId;
      const hasError = this.categoryTrendError() === catId;

      if (!canvasRef || !points || points.length === 0 || isLoading || hasError) {
        this.categoryTrendChart?.destroy();
        this.categoryTrendChart = undefined;
        return;
      }
      this.renderCategoryTrendChart(canvasRef.nativeElement, points);
    });
  }

  selectTab(tab: InsightTabKey): void {
    this.activeTab.set(tab);
    if (this.loadedTabs.has(tab)) {
      return;
    }
    this.fetchTab(tab);
  }

  retryActiveTab(): void {
    this.loadedTabs.delete(this.activeTab());
    this.fetchTab(this.activeTab());
  }

  private fetchTab(tab: InsightTabKey): void {
    this.loading.set(true);
    this.error.set(null);

    const onSuccess = () => {
      this.loadedTabs.add(tab);
      this.loading.set(false);
    };
    const onError = () => {
      this.error.set("Couldn't load this data. Try again.");
      this.loading.set(false);
    };

    switch (tab) {
      case 'analytics':
        this.aiAdminService.getAnalytics().subscribe({
          next: (data: AdminAnalyticsResponse) => { this.analytics.set(data); onSuccess(); },
          error: onError
        });
        break;
      case 'forecast':
        this.aiAdminService.getForecast().subscribe({
          next: (data: AdminForecastResponse) => { this.forecast.set(data); onSuccess(); },
          error: onError
        });
        break;
      case 'customers':
        this.aiAdminService.getCustomers().subscribe({
          next: (data: AdminCustomerInsightsResponse) => { this.customers.set(data); onSuccess(); },
          error: onError
        });
        break;
      case 'rfm':
        this.aiAdminService.getRfmSegments().subscribe({
          next: (data: AdminRfmSegmentsResponse) => { this.rfm.set(data); onSuccess(); },
          error: onError
        });
        break;
      case 'categories':
        // Load the category table and the category-level forecast together.
        forkJoin({
          categories: this.aiAdminService.getCategories(),
          forecast: this.aiAdminService.getCategoryForecast()
        }).subscribe({
          next: ({ categories, forecast }) => {
            this.categories.set(categories);
            this.categoryForecast.set(forecast);
            onSuccess();
          },
          error: onError
        });
        break;
      case 'anomalies':
        this.aiAdminService.getPriceAnomalies().subscribe({
          next: (data: AdminPriceAnomaliesResponse) => { this.anomalies.set(data); onSuccess(); },
          error: onError
        });
        break;
    }
  }

  /**
   * Expands/collapses the inline revenue-trend row under a category.
   * Trend data is fetched once per category and cached for the rest of
   * the session, so re-toggling the same row never re-hits the API.
   */
  toggleCategoryTrend(categoryId: number): void {
    if (this.expandedCategoryId() === categoryId) {
      this.expandedCategoryId.set(null);
      return;
    }

    this.expandedCategoryId.set(categoryId);

    if (this.categoryTrends()[categoryId]) {
      return; // already cached
    }

    this.categoryTrendLoading.set(categoryId);
    this.categoryTrendError.set(null);

    this.aiAdminService.getCategoryTrend(categoryId).subscribe({
      next: (data) => {
        this.categoryTrends.update(map => ({ ...map, [categoryId]: data }));
        this.categoryTrendLoading.set(null);
      },
      error: () => {
        this.categoryTrendError.set(categoryId);
        this.categoryTrendLoading.set(null);
      }
    });
  }

  maxCategoryTrendValue(categoryId: number): number {
    const points = this.categoryTrends()[categoryId] ?? [];
    return points.reduce((max, p) => Math.max(max, p.revenue), 0) || 1;
  }

  getCategoryTrendPoints(categoryId: number): CategoryTrendPoint[] {
    return this.categoryTrends()[categoryId] ?? [];
  }

  isCategoryForecastSkipped(data: AdminCategoryForecastResponse): data is CategoryForecastSkipped {
    return data.status === 'skipped';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(value);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }

  formatPercent(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  sentimentClass(label: string): string {
    const key = label.toLowerCase();
    if (key === 'positive') return 'sentiment-positive';
    if (key === 'negative') return 'sentiment-negative';
    return 'sentiment-neutral';
  }

  customerSegmentClass(segment: CustomerRow['segment']): string {
    return segment === 'high_value' ? 'sentiment-positive' : 'sentiment-negative';
  }

  customerSegmentLabel(segment: CustomerRow['segment']): string {
    return segment === 'high_value' ? 'High value' : 'Inactive';
  }

  /** Approval rate badge: ≥90% healthy, 70–90% needs attention, below that flagged. */
  approvalRateClass(pct: number): string {
    if (pct >= 90) return 'sentiment-positive';
    if (pct >= 70) return 'sentiment-neutral';
    return 'sentiment-negative';
  }

  anomalySeverityClass(severity: number): string {
    if (severity >= 0.15) return 'severity-high';
    if (severity >= 0.05) return 'severity-medium';
    return 'severity-low';
  }

  anomalySeverityLabel(severity: number): string {
    if (severity >= 0.15) return 'high';
    if (severity >= 0.05) return 'medium';
    return 'low';
  }

  /** Width % for the severity gradient bar. 0.30 severity or higher fills the bar completely. */
  severityBarWidth(severity: number): number {
    const MAX_REFERENCE = 0.30;
    return Math.max(4, Math.min(100, (severity / MAX_REFERENCE) * 100));
  }

  anomalyFlag(a: { price: number; category_avg_price: number }): 'OVERPRICED' | 'UNDERPRICED' {
    return a.price > a.category_avg_price ? 'OVERPRICED' : 'UNDERPRICED';
  }

  anomalyFlagClass(a: { price: number; category_avg_price: number }): string {
    return a.price > a.category_avg_price ? 'flag-over' : 'flag-under';
  }

  // ─────────────────────────── Chart builders ───────────────────────────

  private renderRevenueTrendChart(
    canvas: HTMLCanvasElement,
    points: { period: string; net_revenue: number }[]
  ): void {
    this.revenueTrendChart?.destroy();
    this.revenueTrendChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: points.map(p => p.period),
        datasets: [{
          label: 'Net revenue',
          data: points.map(p => p.net_revenue),
          backgroundColor: GOLD_PALE,
          borderColor: GOLD,
          borderWidth: 1.5,
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: TEXT_SOFT } },
          y: {
            grid: { color: GRID_LINE },
            ticks: {
              color: TEXT_SOFT,
              callback: (v) => typeof v === 'number' ? this.formatCurrency(v) : v
            }
          }
        }
      }
    });
  }

  private renderUserGrowthChart(
    canvas: HTMLCanvasElement,
    rows: { period: string; new_sellers: number; new_customers: number }[]
  ): void {
    this.userGrowthChart?.destroy();
    this.userGrowthChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: rows.map(r => r.period),
        datasets: [
          {
            label: 'New sellers',
            data: rows.map(r => r.new_sellers),
            backgroundColor: GOLD,
            borderRadius: 5,
            borderSkipped: false,
          },
          {
            label: 'New customers',
            data: rows.map(r => r.new_customers),
            backgroundColor: BLUE,
            borderRadius: 5,
            borderSkipped: false,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: TEXT_SOFT, font: { size: 10 }, usePointStyle: true } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: TEXT_SOFT, font: { size: 10 } } },
          y: {
            grid: { color: GRID_LINE },
            ticks: { color: TEXT_SOFT, callback: (v) => typeof v === 'number' ? this.formatNumber(v) : v }
          }
        }
      }
    });
  }

  private renderOrderVolumeChart(
    canvas: HTMLCanvasElement,
    rows: { period: string; total_orders: number; delivered: number; cancelled: number }[]
  ): void {
    this.orderVolumeChart?.destroy();
    this.orderVolumeChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: rows.map(r => r.period),
        datasets: [
          {
            label: 'Total',
            data: rows.map(r => r.total_orders),
            backgroundColor: GOLD,
            borderRadius: 5,
            borderSkipped: false,
          },
          {
            label: 'Delivered',
            data: rows.map(r => r.delivered),
            backgroundColor: GREEN,
            borderRadius: 5,
            borderSkipped: false,
          },
          {
            label: 'Cancelled',
            data: rows.map(r => r.cancelled),
            backgroundColor: RED,
            borderRadius: 5,
            borderSkipped: false,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: TEXT_SOFT, font: { size: 10 }, usePointStyle: true } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: TEXT_SOFT, font: { size: 10 } } },
          y: {
            grid: { color: GRID_LINE },
            ticks: { color: TEXT_SOFT, callback: (v) => typeof v === 'number' ? this.formatNumber(v) : v }
          }
        }
      }
    });
  }

  private renderCategoryDistributionChart(
    canvas: HTMLCanvasElement,
    rows: { category: string; total_purchases: number }[]
  ): void {
    this.categoryDistributionChart?.destroy();
    this.categoryDistributionChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: rows.map(r => r.category),
        datasets: [{
          label: 'Purchases',
          data: rows.map(r => r.total_purchases),
          backgroundColor: rows.map((_, i) => PALETTE[i % PALETTE.length]),
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { color: GRID_LINE },
            ticks: { color: TEXT_SOFT, callback: (v) => typeof v === 'number' ? this.formatNumber(v) : v }
          },
          y: { grid: { display: false }, ticks: { color: TEXT_SOFT } }
        }
      }
    });
  }

  private renderForecastChart(canvas: HTMLCanvasElement, data: AdminForecastResponse): void {
    const actualLabels = data.actuals.map(a => a.month);
    const forecastLabels = data.forecast.map(f => f.month);
    const labels = [...actualLabels, ...forecastLabels];

    // Actual series: real values, then null for every forecast month.
    const actualValues: (number | null)[] = [
      ...data.actuals.map(a => a.revenue),
      ...forecastLabels.map(() => null)
    ];

    // Forecast series: null for actual months except the last one (so the
    // dashed line visually connects to the solid line), then predicted values.
    const forecastValues: (number | null)[] = [
      ...actualLabels.map((_, i) => (i === actualLabels.length - 1 ? data.actuals[i].revenue : null)),
      ...data.forecast.map(f => f.forecasted_revenue)
    ];

    this.forecastChart?.destroy();
    this.forecastChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Actual',
            data: actualValues,
            borderColor: GOLD,
            backgroundColor: GOLD_PALE,
            borderWidth: 2,
            tension: 0.35,
            fill: true,
            pointRadius: 4,
            pointBackgroundColor: GOLD,
            spanGaps: false,
          },
          {
            label: 'Forecast',
            data: forecastValues,
            borderColor: GOLD_LIGHT,
            backgroundColor: 'rgba(201, 149, 42, 0.06)',
            borderWidth: 2,
            borderDash: [6, 4],
            tension: 0.35,
            fill: true,
            pointRadius: 4,
            pointStyle: 'rectRot',
            pointBackgroundColor: GOLD_LIGHT,
            spanGaps: false,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: TEXT_SOFT, font: { size: 11 }, usePointStyle: true } }
        },
        scales: {
          x: { grid: { color: GRID_LINE }, ticks: { color: TEXT_SOFT } },
          y: {
            grid: { color: GRID_LINE },
            ticks: {
              color: TEXT_SOFT,
              callback: (v) => typeof v === 'number' ? this.formatCurrency(v) : v
            }
          }
        }
      }
    });
  }

  private renderRfmChart(canvas: HTMLCanvasElement, entries: { segment: string; count: number }[]): void {
    this.rfmChart?.destroy();
    this.rfmChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: entries.map(e => e.segment),
        datasets: [{
          data: entries.map(e => e.count),
          backgroundColor: entries.map((_, i) => PALETTE[i % PALETTE.length]),
          borderWidth: 0,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        plugins: {
          legend: { position: 'bottom', labels: { color: TEXT_SOFT, font: { size: 11 }, usePointStyle: true } }
        }
      }
    });
  }

  private renderCategoryTrendChart(canvas: HTMLCanvasElement, points: CategoryTrendPoint[]): void {
    this.categoryTrendChart?.destroy();
    this.categoryTrendChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: points.map(p => p.period),
        datasets: [{
          data: points.map(p => p.revenue),
          borderColor: GOLD,
          backgroundColor: GOLD_PALE,
          borderWidth: 2,
          tension: 0.35,
          fill: true,
          pointRadius: 3,
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
              label: (ctx) => this.formatCurrency(ctx.parsed.y as number)
            }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: TEXT_SOFT, font: { size: 10 } } },
          y: {
            grid: { color: GRID_LINE },
            ticks: { color: TEXT_SOFT, callback: (v) => typeof v === 'number' ? this.formatCurrency(v) : v }
          }
        }
      }
    });
  }

  private renderCategoryForecastChart(
    canvas: HTMLCanvasElement,
    categories: CategoryForecastItem[]
  ): void {
    if (!categories || categories.length === 0) return;

    // Collect all unique month labels in order
    const allMonths = Array.from(
      new Set(categories.flatMap(c => c.forecast.map(p => p.month)))
    ).sort();

    const datasets = categories.map((cat, i) => {
      const color = PALETTE[i % PALETTE.length];

      // Split into historical (solid) and forecast (dashed) segments.
      // Chart.js doesn't support per-point dash natively, so we render
      // two overlapping datasets per category: one solid, one dashed.
      const historicalData: (number | null)[] = allMonths.map(month => {
        const pt = cat.forecast.find(p => p.month === month);
        return pt && !pt.is_forecast ? pt.forecasted_qty : null;
      });

      const forecastData: (number | null)[] = allMonths.map(month => {
        const pt = cat.forecast.find(p => p.month === month);
        // Include the last historical point so the dashed line connects
        if (!pt) return null;
        if (pt.is_forecast) return pt.forecasted_qty;
        // Bridge: if this is the last historical point, include it in the forecast series too
        const isLastHistorical = cat.forecast
          .filter(p => !p.is_forecast)
          .at(-1)?.month === month;
        return isLastHistorical ? pt.forecasted_qty : null;
      });

      return [
        {
          label: cat.category_name,
          data: historicalData,
          borderColor: color,
          backgroundColor: 'transparent',
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: color,
          spanGaps: false,
          borderDash: [] as number[],
        },
        {
          label: `${cat.category_name} (forecast)`,
          data: forecastData,
          borderColor: color,
          backgroundColor: 'transparent',
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 3,
          pointStyle: 'rectRot' as const,
          pointBackgroundColor: color,
          spanGaps: false,
          borderDash: [6, 4],
        }
      ];
    }).flat();

    this.categoryForecastChart?.destroy();
    this.categoryForecastChart = new Chart(canvas, {
      type: 'line',
      data: { labels: allMonths, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: TEXT_SOFT,
              font: { size: 10 },
              usePointStyle: true,
              // Hide the "(forecast)" legend entries — the dashed line itself signals future
              filter: item => !item.text.includes('(forecast)')
            }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const raw = ctx.parsed.y;
                if (raw == null) return '';
                const isForecast = ctx.dataset.label?.includes('(forecast)');
                return `${ctx.dataset.label?.replace(' (forecast)', '')} — ${this.formatNumber(raw)} orders${isForecast ? ' (projected)' : ''}`;
              }
            }
          }
        },
        scales: {
          x: { grid: { color: GRID_LINE }, ticks: { color: TEXT_SOFT, font: { size: 10 } } },
          y: {
            grid: { color: GRID_LINE },
            ticks: {
              color: TEXT_SOFT,
              callback: (v) => typeof v === 'number' ? this.formatNumber(v) : v
            },
            title: { display: true, text: 'Demand (orders)', color: TEXT_SOFT, font: { size: 10 } }
          }
        }
      }
    });
  }
}