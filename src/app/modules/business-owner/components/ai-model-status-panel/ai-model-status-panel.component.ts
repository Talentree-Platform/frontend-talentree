import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, PercentPipe } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { AiDashboardService } from '../../core/services/ai-dashboard.service';
import { ModelStatusEntry, ModelsStatusResponse } from '../../models/ai-tools.model';

interface ModelCard {
  key: string;
  label: string;
  icon: string;
  entry: ModelStatusEntry;
}

@Component({
  selector: 'app-ai-model-status-panel',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe, PercentPipe],
  template: `
    <div class="panel-card glass-panel">
      <div class="panel-header">
        <div class="title-wrap">
          <span class="icon-glow glow-blue"><i class="fa-solid fa-microchip"></i></span>
          <h3>AI Model Health</h3>
        </div>
        <span class="model-tag">Live model registry</span>
      </div>

      <div class="panel-body">
        <p class="description">The machine-learning models currently powering these insights.</p>

        <div class="shimmer-loader" *ngIf="loading">
          <div class="shimmer-lines">
            <div class="line w-80"></div>
            <div class="line w-60"></div>
          </div>
        </div>

        <div class="model-grid" *ngIf="!loading">
          <div class="model-tile" *ngFor="let m of models">
            <div class="model-tile__head">
              <span class="model-tile__icon"><i class="fa-solid" [ngClass]="m.icon"></i></span>
              <div>
                <span class="model-tile__name">{{ m.label }}</span>
                <span class="model-tile__type">{{ m.entry.model_type }}</span>
              </div>
              <span class="data-source-badge" [class.mock]="m.entry.data_source !== 'real_db'">{{ m.entry.data_source || 'n/a' }}</span>
            </div>

            <div class="model-tile__stats">
              <div class="stat" *ngIf="m.entry.accuracy != null">
                <span class="stat-lbl">Accuracy</span>
                <span class="stat-val">{{ m.entry.accuracy | percent:'1.0-1' }}</span>
              </div>
              <div class="stat" *ngIf="m.entry.f1_score != null">
                <span class="stat-lbl">F1 Score</span>
                <span class="stat-val">{{ m.entry.f1_score | percent:'1.0-1' }}</span>
              </div>
              <div class="stat" *ngIf="m.entry.contamination != null">
                <span class="stat-lbl">Contamination</span>
                <span class="stat-val">{{ m.entry.contamination | percent:'1.1-1' }}</span>
              </div>
              <div class="stat" *ngIf="m.entry.avg_mae != null">
                <span class="stat-lbl">Avg MAE</span>
                <span class="stat-val">{{ m.entry.avg_mae }}</span>
              </div>
              <div class="stat" *ngIf="m.entry.training_rows != null">
                <span class="stat-lbl">Training Rows</span>
                <span class="stat-val">{{ m.entry.training_rows }}</span>
              </div>
              <div class="stat" *ngIf="m.entry.products_trained != null">
                <span class="stat-lbl">Products Trained</span>
                <span class="stat-val">{{ m.entry.products_trained }}</span>
              </div>
            </div>

            <span class="model-tile__updated" *ngIf="m.entry.saved_at">
              Updated {{ m.entry.saved_at | date:'medium' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .panel-card { border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 20px; box-shadow: var(--bo-shadow-card); }
    .glass-panel { background: var(--bo-bg-surface); border: var(--bo-border-surface); backdrop-filter: blur(14px); }
    .panel-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--bo-border-surface-hover); padding-bottom: 12px; }
    .title-wrap { display: flex; align-items: center; gap: 12px; }
    .title-wrap h3 { font-size: 16px; font-weight: 600; color: var(--bo-color-text); margin: 0; }
    .icon-glow { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 8px; font-size: 14px; }
    .glow-blue { background: rgba(59, 130, 246, 0.15); color: #3b82f6; box-shadow: 0 0 10px rgba(59, 130, 246, 0.3); }
    .model-tag { font-size: 10px; background: var(--bo-bg-surface-hover); padding: 4px 8px; border-radius: 12px; color: var(--bo-color-text-muted); border: 1px solid var(--bo-border-surface-hover); }
    .description { font-size: 12.5px; color: var(--bo-color-text-muted); margin: 0; line-height: 1.5; }
    .panel-body { display: flex; flex-direction: column; gap: 16px; }

    .model-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; }
    .model-tile { background: var(--bo-bg-surface-hover); border: 1px solid var(--bo-border-surface-hover); border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 12px; }
    .model-tile__head { display: flex; align-items: center; gap: 10px; }
    .model-tile__icon { width: 28px; height: 28px; border-radius: 7px; display: flex; align-items: center; justify-content: center; background: var(--bo-accent-soft); color: var(--bo-accent); font-size: 12px; flex-shrink: 0; }
    .model-tile__name { display: block; font-size: 13px; font-weight: 700; color: var(--bo-color-text); }
    .model-tile__type { display: block; font-size: 10.5px; color: var(--bo-color-text-muted); }
    .data-source-badge { margin-left: auto; font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .03em; padding: 3px 8px; border-radius: 10px; background: rgba(34, 197, 94, 0.15); color: #22c55e; white-space: nowrap; }
    .data-source-badge.mock { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }

    .model-tile__stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .stat { display: flex; flex-direction: column; gap: 2px; }
    .stat-lbl { font-size: 10px; color: var(--bo-color-text-muted); }
    .stat-val { font-size: 13px; font-weight: 700; color: var(--bo-color-text); }
    .model-tile__updated { font-size: 10.5px; color: var(--bo-color-text-muted); }

    .shimmer-loader { display: flex; flex-direction: column; gap: 12px; }
    .shimmer-lines { display: flex; flex-direction: column; gap: 8px; width: 100%; }
    .shimmer-lines .line { height: 12px; background: linear-gradient(90deg, var(--bo-bg-surface) 25%, var(--bo-bg-surface-hover) 50%, var(--bo-bg-surface) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite linear; border-radius: 4px; }
    .w-60 { width: 60%; } .w-80 { width: 80%; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  `]
})
export class AiModelStatusPanelComponent implements OnInit, OnDestroy {
  private aiSvc = inject(AiDashboardService);
  private destroy$ = new Subject<void>();

  loading = true;
  models: ModelCard[] = [];

  ngOnInit(): void {
    this.loading = true;
    this.aiSvc.getModelsStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: ModelsStatusResponse) => {
        this.models = [
          { key: 'churn', label: 'Churn Prediction', icon: 'fa-user-slash', entry: res.churn_model },
          { key: 'anomaly', label: 'Anomaly Detection', icon: 'fa-chart-line-down', entry: res.anomaly_model },
          { key: 'fraud', label: 'Fraud Detection', icon: 'fa-shield-halved', entry: res.fraud_model },
          { key: 'demand', label: 'Demand Forecasting', icon: 'fa-boxes-stacked', entry: res.demand_model }
        ];
        this.loading = false;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
