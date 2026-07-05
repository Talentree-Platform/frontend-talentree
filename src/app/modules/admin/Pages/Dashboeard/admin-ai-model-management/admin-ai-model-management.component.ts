import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { AiAdminService } from '../../../core/services/ai-admin.service';
import {
  TrainForecastResponse,
  TrainRfmResponse,
  GenericAiActionResponse
} from '../../../core/Interfaces/ai-admin.models';

type ActionKey = 'trainForecast' | 'trainRfm' | 'trainAllBo' | 'computeAllBo' | 'exportKpis' | 'exportFinancial';

interface ConfirmDialogConfig {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
}

@Component({
  selector: 'app-admin-ai-model-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-ai-model-management.component.html',
  styleUrl: './admin-ai-model-management.component.css'
})
export class AdminAiModelManagementComponent {

  // ── Loading / error state per action ──
  loading = signal<Partial<Record<ActionKey, boolean>>>({});
  errors = signal<Partial<Record<ActionKey, string>>>({});

  // ── Results ──
  forecastResult = signal<TrainForecastResponse | null>(null);
  rfmResult = signal<TrainRfmResponse | null>(null);
  allBoResult = signal<GenericAiActionResponse | null>(null);
  computeAllBoResult = signal<GenericAiActionResponse | null>(null);
  lastExportedFile = signal<string | null>(null);

  // ── Financial export form state ──
  boUserId = '';

  // ── Confirm modal (replaces native confirm()) ──
  confirmDialog = signal<ConfirmDialogConfig | null>(null);

  constructor(private aiAdminService: AiAdminService) { }

  private setLoading(key: ActionKey, value: boolean): void {
    this.loading.update(m => ({ ...m, [key]: value }));
  }

  private setError(key: ActionKey, message: string | null): void {
    this.errors.update(m => ({ ...m, [key]: message ?? undefined }));
  }

  isLoading(key: ActionKey): boolean {
    return !!this.loading()[key];
  }

  errorFor(key: ActionKey): string | undefined {
    return this.errors()[key];
  }

  /** Expected duration badges, matching the guide's "~60s / ~3 min / ~5 min" labels. */
  actionDuration(key: ActionKey): string | null {
    switch (key) {
      case 'trainForecast': return '~60s';
      case 'trainRfm': return '~60s';
      case 'trainAllBo': return '~3 min';
      case 'computeAllBo': return '~5 min';
      default: return null;
    }
  }

  // ── Confirm modal ──

  private askConfirm(config: ConfirmDialogConfig): void {
    this.confirmDialog.set(config);
  }

  confirmDialogAccept(): void {
    const dialog = this.confirmDialog();
    this.confirmDialog.set(null);
    dialog?.onConfirm();
  }

  confirmDialogCancel(): void {
    this.confirmDialog.set(null);
  }

  // ── Train / compute actions ──

  runTrainForecast(): void {
    this.setLoading('trainForecast', true);
    this.setError('trainForecast', null);
    this.aiAdminService.trainForecast().subscribe({
      next: (res) => { this.forecastResult.set(res); this.setLoading('trainForecast', false); },
      error: (e) => { this.setError('trainForecast', e?.error?.message ?? 'Failed to retrain forecast model.'); this.setLoading('trainForecast', false); }
    });
  }

  runTrainRfm(): void {
    this.setLoading('trainRfm', true);
    this.setError('trainRfm', null);
    this.aiAdminService.trainRfm().subscribe({
      next: (res) => { this.rfmResult.set(res); this.setLoading('trainRfm', false); },
      error: (e) => { this.setError('trainRfm', e?.error?.message ?? 'Failed to retrain RFM model.'); this.setLoading('trainRfm', false); }
    });
  }

  runTrainAllBo(): void {
    this.askConfirm({
      title: 'Retrain all business owners?',
      message: 'This retrains per-seller models across the whole platform and can take up to 3 minutes. Are you sure you want to continue?',
      confirmLabel: '⚡ Retrain all',
      onConfirm: () => this.executeTrainAllBo()
    });
  }

  private executeTrainAllBo(): void {
    this.setLoading('trainAllBo', true);
    this.setError('trainAllBo', null);
    this.aiAdminService.trainAllBo().subscribe({
      next: (res) => { this.allBoResult.set(res); this.setLoading('trainAllBo', false); },
      error: (e) => { this.setError('trainAllBo', e?.error?.message ?? 'Failed to retrain all business owner models.'); this.setLoading('trainAllBo', false); }
    });
  }

  runComputeAllBo(): void {
    this.askConfirm({
      title: 'Recompute all metrics?',
      message: 'This recomputes derived KPIs and metrics for every business owner and can take up to 5 minutes. Are you sure you want to continue?',
      confirmLabel: '⚡ Recompute all',
      onConfirm: () => this.executeComputeAllBo()
    });
  }

  private executeComputeAllBo(): void {
    this.setLoading('computeAllBo', true);
    this.setError('computeAllBo', null);
    this.aiAdminService.computeAllBo().subscribe({
      next: (res) => { this.computeAllBoResult.set(res); this.setLoading('computeAllBo', false); },
      error: (e) => { this.setError('computeAllBo', e?.error?.message ?? 'Failed to recompute all business owner metrics.'); this.setLoading('computeAllBo', false); }
    });
  }

  // ── Exports ──

  runExportKpis(): void {
    this.setLoading('exportKpis', true);
    this.setError('exportKpis', null);
    this.aiAdminService.exportKpis().subscribe({
      next: (res) => { this.downloadBlob(res, 'talentree_admin_report.xlsx'); this.setLoading('exportKpis', false); },
      error: (e) => { this.setError('exportKpis', e?.error?.message ?? 'Failed to export KPIs.'); this.setLoading('exportKpis', false); }
    });
  }

  runExportFinancial(): void {
    const id = this.boUserId.trim();
    if (!id) {
      this.setError('exportFinancial', 'Enter a business owner ID first.');
      return;
    }
    this.setLoading('exportFinancial', true);
    this.setError('exportFinancial', null);
    this.aiAdminService.exportFinancial(id).subscribe({
      next: (res) => { this.downloadBlob(res, `talentree_bo_${id}_financial_report.csv`); this.setLoading('exportFinancial', false); },
      error: (e) => { this.setError('exportFinancial', e?.error?.message ?? 'Failed to export financial report. Check the business owner ID.'); this.setLoading('exportFinancial', false); }
    });
  }

  /** Reads the filename off Content-Disposition and triggers a browser download. */
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

    this.lastExportedFile.set(filename);
  }

  // ── Template helpers ──

  isForecastSkipped(data: TrainForecastResponse): data is Extract<TrainForecastResponse, { status: 'skipped' }> {
    return data.status === 'skipped';
  }

  rfmLabelEntries(labelMap: Record<string, string>): { key: string; value: string }[] {
    return Object.entries(labelMap).map(([key, value]) => ({ key, value }));
  }

  rfmDistributionEntries(distribution: Record<string, number>): { segment: string; count: number }[] {
    return Object.entries(distribution).map(([segment, count]) => ({ segment, count }));
  }

  jsonPreview(data: unknown): string {
    return JSON.stringify(data, null, 2);
  }
}