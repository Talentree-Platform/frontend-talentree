import { Component, OnInit, signal, computed, viewChild, effect, ElementRef, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { Chart, registerables } from 'chart.js';

import { AiAdminService } from '../../../core/services/ai-admin.service'; // adjust path to match your structure
import { AdminKpis, AdminHealthComponents } from '../../../core/Interfaces/ai-admin.models'; // adjust path to match your structure

Chart.register(...registerables);

const GREEN = '#27A06B';
const AMBER = '#C9952A';
const RED = '#D94040';
const TRACK = '#F4EFE7';

type KpiColor = 'green' | 'blue' | 'purple' | 'orange' | 'red';

interface KpiCardDef {
  key: string;
  color: KpiColor;
  icon: string;
  label: string;
  value: string;
  sub: string;
}

@Component({
  selector: 'app-admin-ai-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-ai-overview.component.html',
  styleUrls: ['./admin-ai-overview.component.css']
})
export class AdminAiOverviewComponent implements OnInit {

  loading = signal(true);

  healthScore = signal<number | null>(null);
  healthLabel = signal<string>('');
  healthComponents = signal<AdminHealthComponents | null>(null);

  kpis = signal<AdminKpis | null>(null);

  /** The 5 headline KPI cards shown at the top of the panel, matching the integration guide's layout. */
  topKpiCards = computed<KpiCardDef[]>(() => {
    const k = this.kpis();
    if (!k) return [];
    return [
      { key: 'conversion', color: 'green', icon: '📈', label: 'Conversion rate', value: `${k.customer_conversion_rate}%`, sub: 'of visitors' },
      { key: 'avgOrder', color: 'blue', icon: '🛒', label: 'Avg order', value: `EGP ${k.average_order_value}`, sub: 'per order' },
      { key: 'satisfaction', color: 'purple', icon: '⭐', label: 'Satisfaction', value: `${k.customer_satisfaction_rating}`, sub: 'out of 5.0' },
      { key: 'fraud', color: 'orange', icon: '🛡️', label: 'Fraud rate', value: `${k.fraud_rate}%`, sub: 'monitor if >10%' },
      { key: 'churn', color: 'red', icon: '📉', label: 'Churn rate', value: `${k.seller_churn_rate}%`, sub: 'sellers at risk' },
    ];
  });

  // ── Health gauge (Chart.js semi-circle, matches the guide) ──
  readonly gaugeCanvas = viewChild<ElementRef<HTMLCanvasElement>>('gaugeCanvas');
  private gaugeChart?: Chart;

  constructor(private aiAdminService: AiAdminService) {
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => this.gaugeChart?.destroy());

    effect(() => {
      const canvasRef = this.gaugeCanvas();
      const score = this.healthScore();
      const isLoading = this.loading();
      if (!canvasRef || isLoading || score === null) {
        this.gaugeChart?.destroy();
        this.gaugeChart = undefined;
        return;
      }
      this.renderGaugeChart(canvasRef.nativeElement, score);
    });
  }

  ngOnInit(): void {
    forkJoin({
      health: this.aiAdminService.getHealth(),
      kpis: this.aiAdminService.getKpis(),
    }).subscribe({
      next: (results) => {
        this.healthScore.set(results.health.health_score);
        this.healthLabel.set(results.health.label);
        this.healthComponents.set(results.health.components);
        this.kpis.set(results.kpis.kpis);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  healthColor(score: number): string {
    if (score >= 70) return 'green';
    if (score >= 50) return 'amber';
    return 'red';
  }

  private healthChartColor(score: number): string {
    const color = this.healthColor(score);
    if (color === 'green') return GREEN;
    if (color === 'amber') return AMBER;
    return RED;
  }

  private renderGaugeChart(canvas: HTMLCanvasElement, score: number): void {
    const clamped = Math.max(0, Math.min(100, score));
    this.gaugeChart?.destroy();
    this.gaugeChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [clamped, 100 - clamped],
          backgroundColor: [this.healthChartColor(score), TRACK],
          borderWidth: 0,
          borderRadius: 6,
        }]
      },
      options: {
        cutout: '78%',
        rotation: -90,
        circumference: 180,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        }
      }
    });
  }
}