import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiDashboardService } from '../../core/services/ai-dashboard.service';
import { ToastService } from '../../core/services/toast.service';
import { FinancialExportFormat } from '../../models/ai-tools.model';

@Component({
  selector: 'app-ai-self-service-tools',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="panel-card glass-panel">
      <div class="panel-header">
        <div class="title-wrap">
          <span class="icon-glow glow-gold"><i class="fa-solid fa-toolbox"></i></span>
          <h3>My AI Tools</h3>
        </div>
        <span class="model-tag">Runs for your account only</span>
      </div>

      <div class="panel-body">
        <!-- Export financial -->
        <div class="tool-row tool-row--export">
          <div class="tool-row__info">
            <span class="tool-row__title"><i class="fa-solid fa-file-export"></i> Export Financial Report</span>
            <span class="tool-row__desc">Download your transaction history for the selected date range.</span>
          </div>
        </div>
        <div class="export-form">
          <select [(ngModel)]="exportFormat" class="dark-input export-select">
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
          </select>
          <input type="date" [(ngModel)]="exportFromDate" class="dark-input" placeholder="From" />
          <input type="date" [(ngModel)]="exportToDate" class="dark-input" placeholder="To" />
          <button class="glow-btn btn-green" (click)="exportFinancial()" [disabled]="loadingExport">
            <span *ngIf="loadingExport"><i class="fa-solid fa-spinner fa-spin"></i></span>
            <span *ngIf="!loadingExport"><i class="fa-solid fa-download"></i> Export</span>
          </button>
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
    .glow-gold { background: var(--bo-accent-soft); color: var(--bo-accent); box-shadow: 0 0 10px rgba(218, 165, 32, 0.3); }
    .model-tag { font-size: 10px; background: var(--bo-bg-surface-hover); padding: 4px 8px; border-radius: 12px; color: var(--bo-color-text-muted); border: 1px solid var(--bo-border-surface-hover); }
    .panel-body { display: flex; flex-direction: column; gap: 10px; }

    .tool-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 12px 0; border-bottom: 1px solid var(--bo-border-surface-hover); }
    .tool-row--export { border-bottom: none; padding-bottom: 4px; }
    .tool-row__info { display: flex; flex-direction: column; gap: 3px; }
    .tool-row__title { font-size: 13.5px; font-weight: 700; color: var(--bo-color-text); display: flex; align-items: center; gap: 8px; }
    .tool-row__desc { font-size: 11.5px; color: var(--bo-color-text-muted); }
    .tool-result { font-size: 12px; color: var(--bo-color-text); background: var(--bo-bg-surface-hover); border-radius: 8px; padding: 8px 12px; margin-top: -4px; }

    .export-form { display: flex; flex-wrap: wrap; gap: 8px; }
    .export-select { flex: 0 0 90px; }
    .dark-input { background: var(--bo-bg-surface-hover); border: 1px solid var(--bo-border-surface-hover); border-radius: 8px; padding: 9px 12px; color: var(--bo-color-text); font-size: 13px; }
    .dark-input:focus { outline: none; border-color: var(--bo-accent); }

    .glow-btn { padding: 9px 18px; border-radius: 8px; font-size: 13.5px; font-weight: 600; color: #fff; border: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.25s; flex-shrink: 0; }
    .btn-green { background: #22c55e; }
    .btn-green:hover:not(:disabled) { box-shadow: 0 0 15px rgba(34, 197, 94, 0.6); transform: translateY(-1px); }
    .glow-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  `]
})
export class AiSelfServiceToolsComponent {
  private aiSvc = inject(AiDashboardService);
  private toastSvc = inject(ToastService);

  loadingExport = false;

  exportFormat: FinancialExportFormat = 'csv';
  exportFromDate = '';
  exportToDate = '';

  exportFinancial(): void {
    this.loadingExport = true;
    this.aiSvc.exportFinancial({
      format: this.exportFormat,
      fromDate: this.exportFromDate || undefined,
      toDate: this.exportToDate || undefined
    }).subscribe({
      next: (blob) => {
        this.loadingExport = false;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `talentree_financial_report.${this.exportFormat}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        this.toastSvc.show('Financial report downloaded', 'success');
      },
      error: () => {
        this.loadingExport = false;
        this.toastSvc.show('Failed to export financial report', 'error');
      }
    });
  }
}
