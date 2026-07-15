import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, PercentPipe, DecimalPipe } from '@angular/common';
import { ReviewTrendsResponse } from '../../models/analytics.model';
import { ChartsComponent, ChartPoint } from '../charts/charts.component';

@Component({
  selector: 'app-review-insights',
  standalone: true,
  imports: [CommonModule, ChartsComponent],
  providers: [PercentPipe, DecimalPipe],
  template: `
    <div class="review-section">
      
      <!-- Metrics row -->
      <div class="metrics-row" *ngIf="trends">
        <div class="metric-mini glass-mini">
          <span class="lbl">Avg Sentiment</span>
          <span class="val highlight-gold">
            {{ Math.round((trends.avg_sentiment + 1) * 50) }}%
          </span>
          <span class="sub">Net score: {{ trends.avg_sentiment >= 0 ? '+' : '' }}{{ trends.avg_sentiment | number:'1.2-2' }}</span>
        </div>

        <div class="metric-mini glass-mini">
          <span class="lbl">Total Reviews</span>
          <span class="val">{{ trends.total_reviews }}</span>
          <span class="sub">Across all listings</span>
        </div>

        <div class="metric-mini glass-mini">
          <span class="lbl">Negative Feedback</span>
          <span class="val" [ngClass]="{'color-danger': trends.negative_review_pct > 15}">
            {{ trends.negative_review_pct }}%
          </span>
          <span class="sub">1-2 Star rating ratio</span>
        </div>
      </div>

      <!-- Dynamic Insights Panel -->
      <div class="insights-card glass-card" *ngIf="trends && insights.length > 0">
        <div class="insights-header">
          <i class="fa-solid fa-brain"></i>
          <h4>AI Review Analysis Insights</h4>
        </div>
        <ul class="insights-list">
          @for (ins of insights; track ins) {
            <li class="insight-item">
              <i class="fa-solid" [ngClass]="getInsightIcon(ins)"></i>
              <span>{{ ins }}</span>
            </li>
          }
        </ul>
      </div>

      <!-- Review Charts Grid -->
      <div class="charts-grid" *ngIf="trends">
        <!-- Sentiment Trend Line -->
        <app-custom-chart
          title="Sentiment Trend over Time"
          subtitle="Measures customer satisfaction index"
          [points]="sentimentPoints"
          type="line"
          strokeColor="#d1a33e"
          fillColor="#d1a33e"
          gradientId="sentimentGrad"
          yFormat="number">
        </app-custom-chart>

        <!-- Negative Reviews Distribution -->
        <app-custom-chart
          title="Negative Review Incidents"
          subtitle="Distribution of 1-2 star feedback points"
          [points]="negativePoints"
          type="bar"
          fillColor="#ef4444"
          gradientId="negReviewGrad"
          yFormat="number">
        </app-custom-chart>

        <!-- Review Volume Chart -->
        <app-custom-chart
          title="Total Review Volume"
          subtitle="Cumulative review submissions count"
          [points]="volumePoints"
          type="bar"
          fillColor="#3b82f6"
          gradientId="volumeGrad"
          yFormat="number">
        </app-custom-chart>
      </div>

      <!-- Loading skeleton -->
      <div class="shimmer-container" *ngIf="loading">
        <div class="shimmer-metrics">
          <div class="s-card"></div>
          <div class="s-card"></div>
          <div class="s-card"></div>
        </div>
        <div class="s-insight"></div>
        <div class="s-chart"></div>
      </div>

    </div>
  `,
  styles: [`
    .review-section {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .metrics-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .metric-mini {
      padding: 18px;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    .glass-mini {
      background: rgba(25, 18, 10, 0.5);
      border: 1px solid rgba(218, 165, 32, 0.1);
      backdrop-filter: blur(10px);
    }

    .lbl {
      font-size: 11px;
      font-weight: 600;
      color: rgba(255,255,255,0.5);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .val {
      font-size: 24px;
      font-weight: 700;
      color: #fff;
    }

    .sub {
      font-size: 11px;
      color: rgba(255,255,255,0.4);
    }

    .highlight-gold {
      background: linear-gradient(90deg, #d1a33e, #fbedcf);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .color-danger {
      color: #ef4444;
    }

    /* Insights card */
    .insights-card {
      background: rgba(188, 70, 66, 0.05) !important;
      border: 1px solid rgba(188, 70, 66, 0.25) !important;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .insights-header {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #ffd875;
      font-size: 14px;
    }

    .insights-header h4 {
      margin: 0;
      font-weight: 600;
      color: #fff;
    }

    .insights-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .insight-item {
      display: flex;
      gap: 10px;
      font-size: 13px;
      color: rgba(255,255,255,0.85);
      line-height: 1.4;
      align-items: flex-start;
    }

    .insight-item i {
      font-size: 14px;
      margin-top: 2px;
    }

    .insight-item i.fa-circle-exclamation { color: #ef4444; }
    .insight-item i.fa-circle-question { color: #f59e0b; }
    .insight-item i.fa-circle-check { color: #22c55e; }

    /* Charts grid */
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 20px;
    }

    /* Shimmer loading */
    .shimmer-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .shimmer-metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .s-card, .s-insight, .s-chart {
      background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite linear;
      border-radius: 12px;
    }

    .s-card { height: 90px; }
    .s-insight { height: 110px; }
    .s-chart { height: 220px; }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `],
})
export class ReviewInsightsComponent implements OnChanges {
  @Input() trends: ReviewTrendsResponse | null = null;
  @Input() loading = false;

  Math = Math;

  sentimentPoints: ChartPoint[] = [];
  negativePoints: ChartPoint[] = [];
  volumePoints: ChartPoint[] = [];
  insights: string[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['trends'] && this.trends) {
      this.mapChartPoints();
      this.generateInsights();
    }
  }

  private mapChartPoints(): void {
    if (!this.trends || !this.trends.data) return;

    this.sentimentPoints = this.trends.data.map(t => ({
      label: t.period,
      value: t.avg_sentiment
    }));

    this.negativePoints = this.trends.data.map(t => ({
      label: t.period,
      value: t.negative_count
    }));

    this.volumePoints = this.trends.data.map(t => ({
      label: t.period,
      value: t.review_count
    }));
  }

  private generateInsights(): void {
    if (!this.trends) return;
    
    const list: string[] = [];
    const pct = this.trends.negative_review_pct;
    const sent = this.trends.avg_sentiment;

    // Insight A: Sentiment Level
    if (sent >= 0.6) {
      list.push('Overall customer sentiment is very strong. Brand affinity is high.');
    } else if (sent >= 0.2) {
      list.push('Customer sentiment is stable, but can be improved with quicker ticket resolutions.');
    } else {
      list.push('Customer satisfaction decreased compared to previous period. Urgent attention is recommended.');
    }

    // Insight B: Negative Ratio
    if (pct > 15) {
      list.push('Negative feedback increased. A high ratio of 1-2 star reviews was received. Audit product batch qualities.');
    } else {
      list.push('Negative feedback ratio remains low (under 15%). Support queues are functioning optimally.');
    }

    // Insight C: Volume trend checks (using last elements of sentiment trend)
    const points = this.trends.data;
    if (points && points.length >= 2) {
      const last = points[points.length - 1];
      const prev = points[points.length - 2];
      if (last.negative_count > prev.negative_count) {
        list.push('Recent spike in negative review count detected in the last logged period. Check product reviews list.');
      }
      if (last.review_count > prev.review_count * 1.5) {
        list.push('Customer feedback submission volume is growing rapidly. Keep responding to maintain loyalty ratings.');
      }
    }

    this.insights = list;
  }

  getInsightIcon(ins: string): string {
    const text = ins.toLowerCase();
    if (text.includes('decreased') || text.includes('increased') || text.includes('spike')) {
      return 'fa-circle-exclamation';
    }
    if (text.includes('stable') || text.includes('growing')) {
      return 'fa-circle-question';
    }
    return 'fa-circle-check';
  }
}
