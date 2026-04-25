import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiResponse, ProductionRequest } from '../../../core/interfaces/i-production-request';
import { ActivatedRoute, Router } from '@angular/router';
import { BoProductionRequestService } from '../../../core/services/bo-production-request.service';
import { NgClass, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-production-request-details',
  standalone: true,
  imports: [NgClass, NgFor, NgIf],
  templateUrl: './production-request-details.component.html',
  styleUrl: './production-request-details.component.css'
})
export class ProductionRequestDetailsComponent implements OnInit, OnDestroy {
  request: ProductionRequest | null = null;

  loading = true;
  error = false;
  errorMessage = '';

  // ── Cancel state ──────────────────────────────────────────────────────────
  showCancelDialog = false;
  cancelling = false;

  // ── Confirm state ─────────────────────────────────────────────────────────
  showConfirmDialog = false;
  confirming = false;

  // ── Toaster ───────────────────────────────────────────────────────────────
  toaster: { message: string; type: 'success' | 'error' } | null = null;
  private toasterTimer: any;

  readonly STATUS_MAP: Record<number, { label: string; cssClass: string }> = {
  0: { label: 'Pending',    cssClass: 'status-pending'    }, // submitted, awaiting review
  1: { label: 'In Review',  cssClass: 'status-review'     }, // taken under review
  2: { label: 'Quoted',     cssClass: 'status-quoted'     }, // quote sent, awaiting client confirm
  3: { label: 'Confirmed',  cssClass: 'status-confirmed'  }, // quote accepted, production starting
  4: { label: 'In Production', cssClass: 'status-inprogress' }, // production started
  5: { label: 'Ready',      cssClass: 'status-ready'      }, // completed, ready for pickup/delivery
  6: { label: 'Delivered',  cssClass: 'status-delivered'  }, // delivered to business owner
  7: { label: 'Cancelled',  cssClass: 'status-cancelled'  }, // cancelled
};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productionRequestService: BoProductionRequestService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (!id || isNaN(id)) {
      this.setError('Invalid request ID.');
      return;
    }

    this.fetchRequest(id);
  }

  ngOnDestroy(): void {
    clearTimeout(this.toasterTimer);
  }

  // ── Data fetching ─────────────────────────────────────────────────────────

  private fetchRequest(id: number): void {
    this.loading = true;
    this.error = false;

    this.productionRequestService.getById(id).subscribe({
      next: (res: ApiResponse<ProductionRequest>) => {
        this.request = res?.data ?? null;
        if (!this.request) { this.setError('Request not found.'); return; }
        this.request.items = this.request.items ?? [];
        this.request.statusHistory = this.request.statusHistory ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.setError(err?.error?.message ?? 'Failed to load production request. Please try again.');
      }
    });
  }

  private setError(message: string): void {
    this.error = true;
    this.errorMessage = message;
    this.loading = false;
  }

  // ── Status helpers ────────────────────────────────────────────────────────

  getStatusInfo(status: number): { label: string; cssClass: string } {
    return this.STATUS_MAP[status] ?? { label: 'Unknown', cssClass: 'status-pending' };
  }

  getStatusClass(status: number): string {
    return this.STATUS_MAP[status]?.cssClass ?? 'status-pending';
  }

  getStatusLabel(status: number): string {
    return this.STATUS_MAP[status]?.label ?? 'Unknown';
  }

  get isCancelled(): boolean {
    return this.request?.status === 7;
  }

  get canConfirm(): boolean {
    return this.request?.quotedPrice != null && this.request?.status === 2;
  }

  // ── Format helpers ────────────────────────────────────────────────────────

  formatDate(dateStr?: string | null): string {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  formatCurrency(value?: number | null): string {
    if (value == null) return '—';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }

  get skeletonItems(): number[] {
    return Array.from({ length: 3 });
  }

  // ── Cancel flow ───────────────────────────────────────────────────────────

  openCancelDialog(): void  { this.showCancelDialog = true;  }
  closeCancelDialog(): void { this.showCancelDialog = false; }

  confirmCancel(): void {
    if (!this.request) return;
    this.showCancelDialog = false;
    this.cancelling = true;

    this.productionRequestService.cancelRequest(this.request.id).subscribe({
      next: () => {
        this.cancelling = false;
        this.showToaster('Request cancelled successfully.', 'success');
        setTimeout(() => this.router.navigate(['/businessowner/ownerProductionRequest']), 1800);
      },
      error: (err) => {
        this.cancelling = false;
        this.showToaster(err?.error?.message ?? 'Failed to cancel request. Please try again.', 'error');
      }
    });
  }

  // ── Confirm flow ──────────────────────────────────────────────────────────

  openConfirmDialog(): void  { this.showConfirmDialog = true;  }
  closeConfirmDialog(): void { this.showConfirmDialog = false; }

  submitConfirm(): void {
    if (!this.request) return;
    this.showConfirmDialog = false;
    this.confirming = true;

    this.productionRequestService.confirmRequest(this.request.id).subscribe({
      next: (res) => {
        this.confirming = false;
        // Patch status from response, fallback to 3 (In Progress)
        if (this.request) {
          this.request = { ...this.request, status: res.data?.status ?? 3 };
        }
        this.showToaster('Request confirmed successfully.', 'success');
      },
      error: (err) => {
        this.confirming = false;
        this.showToaster(err?.error?.message ?? 'Failed to confirm request. Please try again.', 'error');
      }
    });
  }

  // ── Toaster ───────────────────────────────────────────────────────────────

  showToaster(message: string, type: 'success' | 'error'): void {
    clearTimeout(this.toasterTimer);
    this.toaster = { message, type };
    this.toasterTimer = setTimeout(() => { this.toaster = null; }, 4000);
  }

  dismissToaster(): void {
    clearTimeout(this.toasterTimer);
    this.toaster = null;
  }
}