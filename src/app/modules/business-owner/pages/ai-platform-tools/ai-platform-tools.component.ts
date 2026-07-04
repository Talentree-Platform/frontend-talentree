import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AiDashboardService } from '../../core/services/ai-dashboard.service';
import { ToastService } from '../../core/services/toast.service';
import { AiModelStatusPanelComponent } from '../../components/ai-model-status-panel/ai-model-status-panel.component';
import { BenchmarkResponse, ComputeMaterialsAllResponse, NotifyCheckResponse } from '../../models/ai-tools.model';

@Component({
  selector: 'app-ai-platform-tools',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AiModelStatusPanelComponent],
  templateUrl: './ai-platform-tools.component.html',
  styleUrl: './ai-platform-tools.component.css'
})
export class AiPlatformToolsComponent {
  private aiSvc = inject(AiDashboardService);
  private toastSvc = inject(ToastService);

  // Single-item compute tools
  computeProductId = 1;
  computeRequestId = 1;
  loadingComputeProduct = false;
  loadingComputeRequest = false;
  computeProductResult: any = null;
  computeRequestResult: any = null;

  // Platform-wide actions
  loadingComputeAll = false;
  loadingComputeMaterials = false;
  loadingNotifyAll = false;
  loadingBenchmarksAll = false;
  loadingTrainChurn = false;
  loadingTrainFraud = false;
  loadingTrainAnomaly = false;
  loadingTrainAll = false;

  computeAllMessage: string | null = null;
  trainAllMessage: string | null = null;
  materialsResult: ComputeMaterialsAllResponse | null = null;
  notifyAllResult: NotifyCheckResponse | null = null;
  benchmarksAllResult: BenchmarkResponse | null = null;
  trainChurnMessage: string | null = null;
  trainFraudResult: { status: string; rows: number; accuracy: number; f1: number } | null = null;
  trainAnomalyResult: { status: string; rows: number; contamination: number } | null = null;

  // ── Single-item tools ──
  computeProduct(): void {
    this.loadingComputeProduct = true;
    this.computeProductResult = null;
    this.aiSvc.computeProduct(this.computeProductId).subscribe({
      next: (res) => {
        this.computeProductResult = res;
        this.loadingComputeProduct = false;
        this.toastSvc.show('Product recomputed', 'success');
      },
      error: () => {
        this.loadingComputeProduct = false;
        this.toastSvc.show('Failed to recompute product', 'error');
      }
    });
  }

  computeRequest(): void {
    this.loadingComputeRequest = true;
    this.computeRequestResult = null;
    this.aiSvc.computeRequest(this.computeRequestId).subscribe({
      next: (res) => {
        this.computeRequestResult = res;
        this.loadingComputeRequest = false;
        this.toastSvc.show('Production request recomputed', 'success');
      },
      error: () => {
        this.loadingComputeRequest = false;
        this.toastSvc.show('Failed to recompute production request', 'error');
      }
    });
  }

  // ── Platform-wide actions ──
  runComputeAll(): void {
    if (!confirm('This recomputes AI data for the entire platform and takes 3-5 minutes. Continue?')) return;
    this.loadingComputeAll = true;
    this.computeAllMessage = null;
    this.aiSvc.computeAll().subscribe({
      next: (res) => {
        this.computeAllMessage = res.message;
        this.loadingComputeAll = false;
        this.toastSvc.show('Platform recomputation started', 'success');
      },
      error: () => {
        this.loadingComputeAll = false;
        this.toastSvc.show('Failed to start platform recomputation', 'error');
      }
    });
  }

  runComputeMaterialsAll(): void {
    if (!confirm('This recomputes AI data for every material on the platform. Continue?')) return;
    this.loadingComputeMaterials = true;
    this.materialsResult = null;
    this.aiSvc.computeMaterialsAll().subscribe({
      next: (res) => {
        this.materialsResult = res;
        this.loadingComputeMaterials = false;
        this.toastSvc.show(`Recomputed ${res.count} materials`, 'success');
      },
      error: () => {
        this.loadingComputeMaterials = false;
        this.toastSvc.show('Failed to recompute materials', 'error');
      }
    });
  }

  runNotifyCheckAll(): void {
    this.loadingNotifyAll = true;
    this.notifyAllResult = null;
    this.aiSvc.notifyCheckAll().subscribe({
      next: (res) => {
        this.notifyAllResult = res;
        this.loadingNotifyAll = false;
        this.toastSvc.show(`${res.notifications_fired} notification(s) fired platform-wide`, 'success');
      },
      error: () => {
        this.loadingNotifyAll = false;
        this.toastSvc.show('Failed to run the platform notification check', 'error');
      }
    });
  }

  runGetAllBenchmarks(): void {
    this.loadingBenchmarksAll = true;
    this.benchmarksAllResult = null;
    this.aiSvc.getAllBenchmarks().subscribe({
      next: (res) => {
        this.benchmarksAllResult = res;
        this.loadingBenchmarksAll = false;
      },
      error: () => {
        this.loadingBenchmarksAll = false;
        this.toastSvc.show('Failed to load platform benchmarks', 'error');
      }
    });
  }

  runTrainChurn(): void {
    if (!confirm('This retrains the churn-prediction model used by every business owner. Continue?')) return;
    this.loadingTrainChurn = true;
    this.trainChurnMessage = null;
    this.aiSvc.trainChurn().subscribe({
      next: () => {
        this.trainChurnMessage = 'Churn model retrained successfully.';
        this.loadingTrainChurn = false;
        this.toastSvc.show('Churn model retrained', 'success');
      },
      error: () => {
        this.loadingTrainChurn = false;
        this.toastSvc.show('Failed to retrain churn model', 'error');
      }
    });
  }

  runTrainFraud(): void {
    if (!confirm('This retrains the fraud-detection model used by every business owner. Continue?')) return;
    this.loadingTrainFraud = true;
    this.trainFraudResult = null;
    this.aiSvc.trainFraud().subscribe({
      next: (res) => {
        this.trainFraudResult = res;
        this.loadingTrainFraud = false;
        this.toastSvc.show('Fraud model retrained', 'success');
      },
      error: () => {
        this.loadingTrainFraud = false;
        this.toastSvc.show('Failed to retrain fraud model', 'error');
      }
    });
  }

  runTrainAnomaly(): void {
    if (!confirm('This retrains the anomaly-detection model used by every business owner. Continue?')) return;
    this.loadingTrainAnomaly = true;
    this.trainAnomalyResult = null;
    this.aiSvc.trainAnomaly().subscribe({
      next: (res) => {
        this.trainAnomalyResult = res;
        this.loadingTrainAnomaly = false;
        this.toastSvc.show('Anomaly model retrained', 'success');
      },
      error: () => {
        this.loadingTrainAnomaly = false;
        this.toastSvc.show('Failed to retrain anomaly model', 'error');
      }
    });
  }

  runTrainAll(): void {
    if (!confirm('This retrains ALL AI models platform-wide and takes 1-3 minutes. Continue?')) return;
    this.loadingTrainAll = true;
    this.trainAllMessage = null;
    this.aiSvc.trainAll().subscribe({
      next: (res) => {
        this.trainAllMessage = res.message;
        this.loadingTrainAll = false;
        this.toastSvc.show('Platform-wide training started', 'success');
      },
      error: () => {
        this.loadingTrainAll = false;
        this.toastSvc.show('Failed to start platform-wide training', 'error');
      }
    });
  }
}
