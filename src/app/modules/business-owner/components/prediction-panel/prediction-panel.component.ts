import { Component, inject } from '@angular/core';
import { CommonModule, PercentPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiDashboardService } from '../../core/services/ai-dashboard.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-prediction-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [PercentPipe, DecimalPipe],
  template: `
    <div class="prediction-grid">
      
      <!-- Churn Prediction Card -->
      <div class="panel-card glass-panel">
        <div class="panel-header">
          <div class="title-wrap">
            <span class="icon-glow glow-blue"><i class="fa-solid fa-users"></i></span>
            <h3>Customer Churn Prediction</h3>
          </div>
          <span class="model-tag">Model: ChurnML v1.4</span>
        </div>
        <div class="panel-body">
          <p class="description">Analyze customer activity signals to determine the probability of customer churn.</p>
          
          <div class="input-row">
            <input type="text" [(ngModel)]="churnUserId" placeholder="Enter User UUID" class="dark-input" />
            <button (click)="predictChurn()" [disabled]="loadingChurn" class="glow-btn btn-blue">
              <span *ngIf="loadingChurn"><i class="fa-solid fa-spinner fa-spin"></i></span>
              <span *ngIf="!loadingChurn">Analyze</span>
            </button>
          </div>
          
          <div class="result-placeholder" *ngIf="!churnResult && !loadingChurn">
            <i class="fa-solid fa-radar"></i> Ready for analysis
          </div>

          <div class="shimmer-loader" *ngIf="loadingChurn">
            <div class="shimmer-circle"></div>
            <div class="shimmer-lines">
              <div class="line w-60"></div>
              <div class="line w-80"></div>
            </div>
          </div>

          <div class="result-area" *ngIf="churnResult && !loadingChurn">
            <div class="circular-progress-wrap">
              <svg viewBox="0 0 36 36" class="circular-chart {{ getChurnRiskColor(churnResult.churn_risk_score) }}">
                <path class="circle-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path class="circle"
                  [attr.stroke-dasharray]="(churnResult.churn_risk_score * 100) + ', 100'"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <text x="18" y="20.35" class="percentage">{{ Math.round(churnResult.churn_risk_score * 100) }}%</text>
              </svg>
              <div class="risk-summary">
                <span class="score-label">Risk Score</span>
                <span class="badge {{ getChurnRiskColor(churnResult.churn_risk_score) }}-badge">
                  {{ getChurnRiskLabel(churnResult.churn_risk_score) }}
                </span>
              </div>
            </div>
            <div class="recommendation-banner" [ngClass]="getChurnRiskColor(churnResult.churn_risk_score) + '-banner'">
              <i class="fa-solid fa-lightbulb"></i>
              <span class="rec-text">{{ getChurnRecommendation(churnResult.churn_risk_score) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Fraud Detection Card -->
      <div class="panel-card glass-panel">
        <div class="panel-header">
          <div class="title-wrap">
            <span class="icon-glow glow-red"><i class="fa-solid fa-shield-halved"></i></span>
            <h3>Fraud Detection Engine</h3>
          </div>
          <span class="model-tag">Model: FraudGuard AI</span>
        </div>
        <div class="panel-body">
          <p class="description">Analyze transaction and access meta-data to flag fraudulent account action.</p>
          
          <div class="input-row">
            <input type="number" [(ngModel)]="fraudRequestId" placeholder="Enter Request ID" class="dark-input" />
            <button (click)="predictFraud()" [disabled]="loadingFraud" class="glow-btn btn-red">
              <span *ngIf="loadingFraud"><i class="fa-solid fa-spinner fa-spin"></i></span>
              <span *ngIf="!loadingFraud">Audit</span>
            </button>
          </div>
          
          <div class="result-placeholder" *ngIf="!fraudResult && !loadingFraud">
            <i class="fa-solid fa-shield"></i> Ready for system audit
          </div>

          <div class="shimmer-loader" *ngIf="loadingFraud">
            <div class="shimmer-lines">
              <div class="line w-40"></div>
              <div class="line w-70"></div>
              <div class="line w-90"></div>
            </div>
          </div>

          <div class="result-area" *ngIf="fraudResult && !loadingFraud">
            <div class="fraud-outcome">
              <div class="fraud-meter">
                <div class="meter-bar">
                  <div class="meter-fill" [style.width.%]="fraudResult.fraud_score * 100" [ngClass]="getFraudColorClass(fraudResult.fraud_score)"></div>
                </div>
                <div class="meter-labels">
                  <span>Score: {{ fraudResult.fraud_score | percent:'1.1-1' }}</span>
                  <span class="status-badge" [ngClass]="fraudResult.is_fraud ? 'badge-danger' : 'badge-success'">
                    {{ fraudResult.is_fraud ? 'SUSPICIOUS' : 'SECURE' }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="alert-banner" [ngClass]="getFraudBannerClass(fraudResult.fraud_score, fraudResult.is_fraud)">
              <span class="alert-icon">
                <i class="fa-solid" [ngClass]="fraudResult.is_fraud ? 'fa-circle-exclamation' : 'fa-circle-check'"></i>
              </span>
              <div class="alert-desc">
                <h4>{{ fraudResult.is_fraud ? 'Danger Flagged' : 'Safe Action' }}</h4>
                <p>{{ getFraudDescription(fraudResult.fraud_score, fraudResult.is_fraud) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Transaction Anomaly Detection -->
      <div class="panel-card glass-panel">
        <div class="panel-header">
          <div class="title-wrap">
            <span class="icon-glow glow-gold"><i class="fa-solid fa-chart-line-down"></i></span>
            <h3>Transaction Anomaly</h3>
          </div>
          <span class="model-tag">Model: AnomalyNet v2</span>
        </div>
        <div class="panel-body">
          <p class="description">Scan transaction patterns and values to isolate deviance from baseline records.</p>
          
          <div class="input-row">
            <input type="number" [(ngModel)]="anomalyTxId" placeholder="Enter Transaction ID" class="dark-input" />
            <button (click)="predictAnomaly()" [disabled]="loadingAnomaly" class="glow-btn btn-gold">
              <span *ngIf="loadingAnomaly"><i class="fa-solid fa-spinner fa-spin"></i></span>
              <span *ngIf="!loadingAnomaly">Scan</span>
            </button>
          </div>
          
          <div class="result-placeholder" *ngIf="!anomalyResult && !loadingAnomaly">
            <i class="fa-solid fa-radar-scan"></i> Ready for anomaly scan
          </div>

          <div class="shimmer-loader" *ngIf="loadingAnomaly">
            <div class="shimmer-lines">
              <div class="line w-50"></div>
              <div class="line w-60"></div>
              <div class="line w-85"></div>
            </div>
          </div>

          <div class="result-area" *ngIf="anomalyResult && !loadingAnomaly">
            <div class="anomaly-outcome">
              <div class="outcome-header">
                <span class="score-lbl">Deviance Score</span>
                <span class="score-val highlight-gold">{{ anomalyResult.anomaly_score | number:'1.2-2' }}</span>
              </div>
              
              <div class="badge-status-row">
                <span class="status-badge" [ngClass]="anomalyResult.is_anomaly ? 'badge-danger' : 'badge-success'">
                  {{ anomalyResult.is_anomaly ? 'Anomaly Detected' : 'Normal Activity' }}
                </span>
              </div>

              <div class="explanation-box">
                <h5>Explanation of activity:</h5>
                <p>{{ getAnomalyExplanation(anomalyResult.anomaly_score, anomalyResult.is_anomaly) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sentiment Prediction Card -->
      <div class="panel-card glass-panel">
        <div class="panel-header">
          <div class="title-wrap">
            <span class="icon-glow glow-green"><i class="fa-solid fa-magnifying-glass-chart"></i></span>
            <h3>Sentiment Predictor</h3>
          </div>
          <span class="model-tag">Model: NLP-Sentiment</span>
        </div>
        <div class="panel-body">
          <p class="description">Analyze review textual assets to predict customer sentiment classification and emotions.</p>
          
          <div class="input-row">
            <input type="number" [(ngModel)]="sentimentReviewId" placeholder="Enter Review ID" class="dark-input" />
            <button (click)="predictSentiment()" [disabled]="loadingSentiment" class="glow-btn btn-green">
              <span *ngIf="loadingSentiment"><i class="fa-solid fa-spinner fa-spin"></i></span>
              <span *ngIf="!loadingSentiment">Predict</span>
            </button>
          </div>
          
          <div class="result-placeholder" *ngIf="!sentimentResult && !loadingSentiment">
            <i class="fa-solid fa-comment-dots"></i> Ready for NLP parsing
          </div>

          <div class="shimmer-loader" *ngIf="loadingSentiment">
            <div class="shimmer-circle"></div>
            <div class="shimmer-lines">
              <div class="line w-60"></div>
              <div class="line w-40"></div>
            </div>
          </div>

          <div class="result-area" *ngIf="sentimentResult && !loadingSentiment">
            <div class="sentiment-outcome">
              <div class="sentiment-badge-row">
                <span class="sentiment-lbl" [ngClass]="getSentimentLabelClass(sentimentResult.sentiment_label)">
                  {{ sentimentResult.sentiment_label }}
                </span>
                <span class="emotion-indicator" *ngIf="sentimentResult.flagged_toxic">
                  <span class="emoji">⚠️</span>
                  <span class="emo-text">Flagged toxic</span>
                </span>
              </div>

              <div class="confidence-meter">
                <div class="conf-header">
                  <span>Sentiment Score</span>
                  <span>{{ sentimentResult.sentiment_score | number:'1.2-2' }}</span>
                </div>
                <div class="bar-track">
                  <div class="bar-fill" [style.width.%]="normalizeSentimentScore(sentimentResult.sentiment_score)" [ngClass]="getSentimentLabelClass(sentimentResult.sentiment_label)"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Ticket Triage Card -->
      <div class="panel-card glass-panel">
        <div class="panel-header">
          <div class="title-wrap">
            <span class="icon-glow glow-blue"><i class="fa-solid fa-headset"></i></span>
            <h3>Support Ticket Triage</h3>
          </div>
          <span class="model-tag">Model: TriageNLP</span>
        </div>
        <div class="panel-body">
          <p class="description">Auto-categorize a support ticket and estimate its priority for faster routing.</p>

          <div class="input-row">
            <input type="number" [(ngModel)]="triageTicketId" placeholder="Enter Ticket ID" class="dark-input" />
            <button (click)="predictTriage()" [disabled]="loadingTriage" class="glow-btn btn-blue">
              <span *ngIf="loadingTriage"><i class="fa-solid fa-spinner fa-spin"></i></span>
              <span *ngIf="!loadingTriage">Triage</span>
            </button>
          </div>

          <div class="result-placeholder" *ngIf="!triageResult && !loadingTriage">
            <i class="fa-solid fa-headset"></i> Ready to triage a ticket
          </div>

          <div class="shimmer-loader" *ngIf="loadingTriage">
            <div class="shimmer-lines">
              <div class="line w-50"></div>
              <div class="line w-70"></div>
            </div>
          </div>

          <div class="result-area" *ngIf="triageResult && !loadingTriage">
            <div class="sentiment-outcome">
              <div class="sentiment-badge-row">
                <span class="emotion-indicator">
                  <span class="emo-text">{{ triageResult.auto_category }}</span>
                </span>
              </div>
              <div class="confidence-meter">
                <div class="conf-header">
                  <span>Priority Score</span>
                  <span>{{ triageResult.priority_score | percent:'1.0-0' }}</span>
                </div>
                <div class="bar-track">
                  <div class="bar-fill" [style.width.%]="triageResult.priority_score * 100" [ngClass]="getTriagePriorityClass(triageResult.priority_score)"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Demand Forecast Card -->
      <div class="panel-card glass-panel">
        <div class="panel-header">
          <div class="title-wrap">
            <span class="icon-glow glow-green"><i class="fa-solid fa-boxes-stacked"></i></span>
            <h3>Product Demand Forecast</h3>
          </div>
          <span class="model-tag">Model: DemandLR</span>
        </div>
        <div class="panel-body">
          <p class="description">Forecast upcoming demand for a product and flag it if stock is likely to run low.</p>

          <div class="input-row">
            <input type="number" [(ngModel)]="demandProductId" placeholder="Enter Product ID" class="dark-input" />
            <button (click)="predictDemand()" [disabled]="loadingDemand" class="glow-btn btn-green">
              <span *ngIf="loadingDemand"><i class="fa-solid fa-spinner fa-spin"></i></span>
              <span *ngIf="!loadingDemand">Forecast</span>
            </button>
          </div>

          <div class="result-placeholder" *ngIf="!demandResult && !loadingDemand">
            <i class="fa-solid fa-chart-line"></i> Ready to forecast demand
          </div>

          <div class="shimmer-loader" *ngIf="loadingDemand">
            <div class="shimmer-lines">
              <div class="line w-60"></div>
              <div class="line w-80"></div>
            </div>
          </div>

          <div class="result-area" *ngIf="demandResult && !loadingDemand">
            <div class="anomaly-outcome">
              <div class="outcome-header">
                <span class="score-lbl">Forecasted Units (next period)</span>
                <span class="score-val highlight-gold">{{ demandResult.demand_forecast_qty }}</span>
              </div>
              <div class="badge-status-row">
                <span class="status-badge" [ngClass]="demandResult.low_stock_flag ? 'badge-danger' : 'badge-success'">
                  {{ demandResult.low_stock_flag ? 'Low Stock Risk' : 'Stock Healthy' }}
                </span>
              </div>
              <div class="explanation-box">
                <h5>Recommendation:</h5>
                <p>{{ demandResult.low_stock_flag ? 'Demand is projected to outpace current stock levels — consider restocking soon.' : 'Projected demand is within a safe range for current stock levels.' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .prediction-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .panel-card {
      border-radius: 16px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
      min-height: 360px;
    }

    .glass-panel {
      background: var(--bg-card);
      border: var(--border-card);
      backdrop-filter: blur(14px);
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid var(--border-card);
      padding-bottom: 12px;
    }

    .title-wrap {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .title-wrap h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--color-card-value);
      margin: 0;
    }

    .icon-glow {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      font-size: 14px;
    }

    .glow-blue { background: rgba(59, 130, 246, 0.15); color: #3b82f6; box-shadow: 0 0 10px rgba(59, 130, 246, 0.3); }
    .glow-red { background: rgba(239, 68, 68, 0.15); color: #ef4444; box-shadow: 0 0 10px rgba(239, 68, 68, 0.3); }
    .glow-gold { background: rgba(218, 165, 32, 0.15); color: var(--color-eyebrow); box-shadow: 0 0 10px rgba(218, 165, 32, 0.3); }
    .glow-green { background: rgba(34, 197, 94, 0.15); color: #22c55e; box-shadow: 0 0 10px rgba(34, 197, 94, 0.3); }

    .model-tag {
      font-size: 10px;
      background: var(--bg-placeholder);
      padding: 4px 8px;
      border-radius: 12px;
      color: var(--color-card-sub);
      border: 1px solid var(--border-card);
    }

    .description {
      font-size: 12.5px;
      color: var(--color-text-muted);
      margin: 0;
      line-height: 1.5;
    }

    .panel-body {
      display: flex;
      flex-direction: column;
      gap: 16px;
      flex-grow: 1;
    }

    .input-row {
      display: flex;
      gap: 8px;
    }

    .dark-input {
      flex-grow: 1;
      background: var(--bg-input);
      border: 1px solid var(--border-input);
      border-radius: 8px;
      padding: 9px 14px;
      color: var(--color-input-text);
      font-size: 13.5px;
      transition: border-color 0.25s;
    }

    .dark-input:focus {
      outline: none;
      border-color: var(--color-tab-btn-active);
    }

    .glow-btn {
      padding: 9px 18px;
      border-radius: 8px;
      font-size: 13.5px;
      font-weight: 600;
      color: #fff;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.25s;
    }

    .btn-blue { background: #3b82f6; }
    .btn-blue:hover:not(:disabled) { box-shadow: 0 0 15px rgba(59, 130, 246, 0.6); transform: translateY(-1px); }
    .btn-red { background: #ef4444; }
    .btn-red:hover:not(:disabled) { box-shadow: 0 0 15px rgba(239, 68, 68, 0.6); transform: translateY(-1px); }
    .btn-gold { background: var(--color-eyebrow); }
    .btn-gold:hover:not(:disabled) { box-shadow: 0 0 15px rgba(218, 165, 32, 0.6); transform: translateY(-1px); }
    .btn-green { background: #22c55e; }
    .btn-green:hover:not(:disabled) { box-shadow: 0 0 15px rgba(34, 197, 94, 0.6); transform: translateY(-1px); }

    .glow-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .result-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      flex-grow: 1;
      border: 1.5px dashed var(--border-card);
      border-radius: 12px;
      color: var(--color-placeholder);
      font-size: 13px;
      min-height: 140px;
    }

    .result-placeholder i {
      font-size: 24px;
    }

    .result-area {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      gap: 16px;
      animation: fadeIn 0.3s ease forwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Churn Circular chart styles */
    .circular-progress-wrap {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .circular-chart {
      width: 72px;
      height: 72px;
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
      transition: stroke-dasharray 0.5s ease;
    }

    .chart-low .circle { stroke: #22c55e; }
    .chart-medium .circle { stroke: #f59e0b; }
    .chart-high .circle { stroke: #ef4444; }

    .percentage {
      fill: var(--color-circle-text);
      font-family: sans-serif;
      font-size: 9px;
      font-weight: 700;
      text-anchor: middle;
    }

    .risk-summary {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .score-label {
      font-size: 11px;
      color: var(--color-card-sub);
    }

    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .chart-low-badge { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
    .chart-medium-badge { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
    .chart-high-badge { background: rgba(239, 68, 68, 0.15); color: #ef4444; }

    .recommendation-banner {
      display: flex;
      gap: 12px;
      padding: 12px;
      border-radius: 8px;
      font-size: 12.5px;
      align-items: flex-start;
      line-height: 1.4;
    }

    .chart-low-banner { background: rgba(34, 197, 94, 0.08); color: rgba(34, 197, 94, 0.9); border: 1px solid rgba(34, 197, 94, 0.15); }
    .chart-medium-banner { background: rgba(245, 158, 11, 0.08); color: rgba(245, 158, 11, 0.9); border: 1px solid rgba(245, 158, 11, 0.15); }
    .chart-high-banner { background: rgba(239, 68, 68, 0.08); color: rgba(239, 68, 68, 0.9); border: 1px solid rgba(239, 68, 68, 0.15); }

    /* Fraud engine styles */
    .fraud-outcome {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .fraud-meter {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .meter-bar {
      background: var(--bg-progress-track);
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
    }

    .meter-fill {
      height: 100%;
      transition: width 0.5s ease;
      border-radius: 4px;
    }

    .meter-fill.safe { background: #22c55e; }
    .meter-fill.warning { background: #f59e0b; }
    .meter-fill.danger { background: #ef4444; }

    .meter-labels {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: var(--color-text-muted);
      font-weight: 600;
    }

    .status-badge {
      font-size: 10.5px;
      padding: 3px 8px;
      border-radius: 4px;
      font-weight: 700;
    }

    .badge-success { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
    .badge-danger { background: rgba(239, 68, 68, 0.15); color: #ef4444; }

    .alert-banner {
      display: flex;
      gap: 14px;
      padding: 14px;
      border-radius: 10px;
    }

    .alert-banner.banner-safe { background: rgba(34, 197, 94, 0.06); border: 1px solid rgba(34, 197, 94, 0.15); color: var(--color-card-value); }
    .alert-banner.banner-warning { background: rgba(245, 158, 11, 0.06); border: 1px solid rgba(245, 158, 11, 0.15); color: var(--color-card-value); }
    .alert-banner.banner-danger { background: rgba(239, 68, 68, 0.06); border: 1px solid rgba(239, 68, 68, 0.15); color: var(--color-card-value); }

    .alert-icon { font-size: 18px; }
    .alert-banner.banner-safe .alert-icon { color: #22c55e; }
    .alert-banner.banner-warning .alert-icon { color: #f59e0b; }
    .alert-banner.banner-danger .alert-icon { color: #ef4444; }

    .alert-desc h4 { margin: 0 0 4px; font-size: 13.5px; font-weight: 700; }
    .alert-desc p { margin: 0; font-size: 11.5px; color: var(--color-card-sub); line-height: 1.4; }

    /* Transaction anomaly styles */
    .anomaly-outcome {
      display: flex;
      flex-direction: column;
      gap: 12px;
      flex-grow: 1;
    }

    .outcome-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .score-lbl { font-size: 13px; color: var(--color-card-sub); }
    .score-val { font-size: 22px; font-weight: 700; }

    .highlight-gold {
      background: var(--color-highlight-gold);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .badge-status-row { display: flex; }

    .explanation-box {
      background: var(--bg-explanation-box);
      border: var(--border-explanation-box);
      border-radius: 8px;
      padding: 12px;
      font-size: 12px;
      line-height: 1.4;
    }

    .explanation-box h5 { margin: 0 0 6px; font-size: 12px; font-weight: 600; color: var(--color-card-sub); }
    .explanation-box p { margin: 0; color: var(--color-card-value); }

    /* Sentiment / NLP Styles */
    .sentiment-badge-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .sentiment-lbl {
      font-size: 16px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .sentiment-lbl.Positive { color: #22c55e; }
    .sentiment-lbl.Neutral { color: var(--color-card-value); }
    .sentiment-lbl.Negative { color: #ef4444; }

    .emotion-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--bg-placeholder);
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
    }

    .emotion-indicator .emoji { font-size: 14px; }
    .emotion-indicator .emo-text { font-weight: 600; color: var(--color-card-value); text-transform: capitalize; }

    .confidence-meter {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .conf-header {
      display: flex;
      justify-content: space-between;
      font-size: 11.5px;
      color: var(--color-card-sub);
      font-weight: 500;
    }

    .bar-track {
      background: var(--bg-progress-track);
      height: 6px;
      border-radius: 3px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.5s ease;
    }

    .bar-fill.Positive { background: #22c55e; }
    .bar-fill.Neutral { background: var(--color-card-sub); }
    .bar-fill.Negative { background: #ef4444; }

    /* Shimmer loadings */
    .shimmer-loader {
      display: flex;
      flex-direction: column;
      gap: 12px;
      flex-grow: 1;
      padding: 10px 0;
    }

    .shimmer-circle {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: var(--bg-shimmer);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite linear;
    }

    .shimmer-lines {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
    }

    .shimmer-lines .line {
      height: 12px;
      background: var(--bg-shimmer);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite linear;
      border-radius: 4px;
    }

    .w-40 { width: 40%; }
    .w-50 { width: 50%; }
    .w-60 { width: 60%; }
    .w-70 { width: 70%; }
    .w-80 { width: 80%; }
    .w-85 { width: 85%; }
    .w-90 { width: 90%; }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `],
})
export class PredictionPanelComponent {
  private aiSvc = inject(AiDashboardService);
  private toastSvc = inject(ToastService);

  Math = Math;

  // Input bindings
  churnUserId = '11111111-1111-1111-1111-111111111101';
  fraudRequestId = 1;
  anomalyTxId = 1;
  sentimentReviewId = 1;
  triageTicketId = 1;
  demandProductId = 1;

  // Loaders
  loadingChurn = false;
  loadingFraud = false;
  loadingAnomaly = false;
  loadingSentiment = false;
  loadingTriage = false;
  loadingDemand = false;

  // Results
  churnResult: any = null;
  fraudResult: any = null;
  anomalyResult: any = null;
  sentimentResult: any = null;
  triageResult: any = null;
  demandResult: any = null;

  predictChurn(): void {
    if (!this.churnUserId.trim()) {
      this.toastSvc.show('Please enter a User ID', 'error');
      return;
    }
    this.loadingChurn = true;
    this.churnResult = null;
    this.aiSvc.predictChurn(this.churnUserId).subscribe({
      next: (res) => {
        this.churnResult = res;
        this.loadingChurn = false;
        this.toastSvc.show('Churn Prediction Complete', 'success');
      },
      error: () => {
        this.loadingChurn = false;
        this.toastSvc.show('Failed to load Churn Prediction', 'error');
      }
    });
  }

  predictFraud(): void {
    if (this.fraudRequestId == null) {
      this.toastSvc.show('Please enter a Request ID', 'error');
      return;
    }
    this.loadingFraud = true;
    this.fraudResult = null;
    this.aiSvc.predictFraud(this.fraudRequestId).subscribe({
      next: (res) => {
        this.fraudResult = res;
        this.loadingFraud = false;
        this.toastSvc.show('Fraud Audit Complete', 'success');
      },
      error: () => {
        this.loadingFraud = false;
        this.toastSvc.show('Failed to run Fraud Audit', 'error');
      }
    });
  }

  predictAnomaly(): void {
    if (this.anomalyTxId == null) {
      this.toastSvc.show('Please enter a Transaction ID', 'error');
      return;
    }
    this.loadingAnomaly = true;
    this.anomalyResult = null;
    this.aiSvc.predictAnomaly(this.anomalyTxId).subscribe({
      next: (res) => {
        this.anomalyResult = res;
        this.loadingAnomaly = false;
        this.toastSvc.show('Anomaly Scan Complete', 'success');
      },
      error: () => {
        this.loadingAnomaly = false;
        this.toastSvc.show('Failed to run Anomaly Scan', 'error');
      }
    });
  }

  predictSentiment(): void {
    if (this.sentimentReviewId == null) {
      this.toastSvc.show('Please enter a Review ID', 'error');
      return;
    }
    this.loadingSentiment = true;
    this.sentimentResult = null;
    this.aiSvc.predictSentiment(this.sentimentReviewId).subscribe({
      next: (res) => {
        this.sentimentResult = res;
        this.loadingSentiment = false;
        this.toastSvc.show('NLP Sentiment Predicted', 'success');
      },
      error: () => {
        this.loadingSentiment = false;
        this.toastSvc.show('Failed to run NLP Sentiment', 'error');
      }
    });
  }

  predictTriage(): void {
    if (this.triageTicketId == null) {
      this.toastSvc.show('Please enter a Ticket ID', 'error');
      return;
    }
    this.loadingTriage = true;
    this.triageResult = null;
    this.aiSvc.predictTriage(this.triageTicketId).subscribe({
      next: (res) => {
        this.triageResult = res;
        this.loadingTriage = false;
        this.toastSvc.show('Ticket Triaged', 'success');
      },
      error: () => {
        this.loadingTriage = false;
        this.toastSvc.show('Failed to triage ticket', 'error');
      }
    });
  }

  predictDemand(): void {
    if (this.demandProductId == null) {
      this.toastSvc.show('Please enter a Product ID', 'error');
      return;
    }
    this.loadingDemand = true;
    this.demandResult = null;
    this.aiSvc.predictDemand(this.demandProductId).subscribe({
      next: (res) => {
        this.demandResult = res;
        this.loadingDemand = false;
        this.toastSvc.show('Demand Forecast Complete', 'success');
      },
      error: () => {
        this.loadingDemand = false;
        this.toastSvc.show('Failed to forecast demand', 'error');
      }
    });
  }

  // Helpers for Churn
  getChurnRiskColor(score: number): string {
    if (score < 0.3) return 'chart-low';
    if (score < 0.6) return 'chart-medium';
    return 'chart-high';
  }

  getChurnRiskLabel(score: number): string {
    if (score < 0.3) return 'Low Risk';
    if (score < 0.6) return 'Medium Risk';
    return 'High Risk';
  }

  getChurnRecommendation(score: number): string {
    if (score < 0.3) return 'Users appear stable. Focus on standard loyalty updates.';
    if (score < 0.6) return 'Consider targeted engagement campaigns and surveys.';
    return 'Immediate retention action recommended! Reach out with a direct deal.';
  }

  // Helpers for Fraud
  getFraudColorClass(score: number): string {
    if (score < 0.25) return 'safe';
    if (score < 0.6) return 'warning';
    return 'danger';
  }

  getFraudBannerClass(score: number, isFraud: boolean): string {
    if (isFraud || score >= 0.6) return 'banner-danger';
    if (score >= 0.25) return 'banner-warning';
    return 'banner-safe';
  }

  getFraudDescription(score: number, isFraud: boolean): string {
    if (isFraud || score >= 0.6) {
      return `This action triggers severe flags. Score: ${Math.round(score * 100)}%. Block status advised immediately.`;
    }
    if (score >= 0.25) {
      return `Activity deviates slightly from regular profile. Score: ${Math.round(score * 100)}%. Monitor ongoing transactions.`;
    }
    return `Transaction indicators correspond to authentic baseline behavior. Audit clean.`;
  }

  // Helpers for Anomaly
  getAnomalyExplanation(score: number, isAnomaly: boolean): string {
    if (isAnomaly) {
      return `Deviance score is high (${score.toFixed(2)}). An unusual order volume or rapid checkout timing from an atypical IP range was logged. Review transaction records.`;
    }
    return `Transaction values conform to regular distributions. Deviance score (${score.toFixed(2)}) is well within acceptable limits. No actions needed.`;
  }

  // Helpers for Sentiment
  getSentimentLabelClass(sentiment: string): string {
    return sentiment || 'Neutral';
  }

  // sentiment_score ranges roughly -1..1; map it onto a 0-100% bar width
  normalizeSentimentScore(score: number): number {
    return Math.max(0, Math.min(100, ((score + 1) / 2) * 100));
  }

  // Helpers for Triage
  getTriagePriorityClass(score: number): string {
    if (score < 0.34) return 'safe';
    if (score < 0.67) return 'warning';
    return 'danger';
  }
}
