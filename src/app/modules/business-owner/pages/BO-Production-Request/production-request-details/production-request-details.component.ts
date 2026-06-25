import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { ApiResponse, ProductionRequest } from '../../../core/interfaces/i-production-request';
import { BoProductionRequestService } from '../../../core/services/bo-production-request.service';
import { PaymentService } from '../../../core/services/payment.service';
import { PaymentIntentData } from '../../../core/interfaces/payment';
import { PaymentModalComponent } from '../../../components/payment-modal/payment-modal/payment-modal.component';

import { environment } from '../../../../../core/environment/envirinment';

@Component({
  selector: 'app-production-request-details',
  standalone: true,
  imports: [NgClass, NgFor, NgIf, PaymentModalComponent],
  templateUrl: './production-request-details.component.html',
  styleUrl: './production-request-details.component.scss',
})
export class ProductionRequestDetailsComponent implements OnInit, OnDestroy {
  // ── Services (inject() style) ─────────────────────────────────────────────
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productionRequestService = inject(BoProductionRequestService);
  private readonly paymentService = inject(PaymentService);

  // ── Request data ──────────────────────────────────────────────────────────
  request: ProductionRequest | null = null;

  // ── General UI state ──────────────────────────────────────────────────────
  loading = true;
  error = false;
  errorMessage = '';

  // ── Cancel state ──────────────────────────────────────────────────────────
  showCancelDialog = false;
  cancelling = false;

  // ── Confirm state ─────────────────────────────────────────────────────────
  showConfirmDialog = false;
  confirming = false;

  // ── Payment state ─────────────────────────────────────────────────────────
  showPaymentModal = false;
  paymentLoading = false;     // true while createIntent call is in-flight
  processingPayment = false;  // true while Stripe is confirming the payment
  paymentIntentData: PaymentIntentData | null = null;
  paymentError = '';          // inline error under the payment section

  /** Stripe publishable key from environment */
  readonly stripePublishableKey = environment.stripePublishableKey;

  // ── Toaster ───────────────────────────────────────────────────────────────
  toaster: { message: string; type: 'success' | 'error' } | null = null;
  private toasterTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Status map ────────────────────────────────────────────────────────────
  readonly STATUS_MAP: Record<number, { label: string; cssClass: string }> = {
    0: { label: 'Pending',       cssClass: 'status-pending'     },
    1: { label: 'In Review',     cssClass: 'status-review'      },
    2: { label: 'Quoted',        cssClass: 'status-quoted'      },
    3: { label: 'Confirmed',     cssClass: 'status-confirmed'   },
    4: { label: 'In Production', cssClass: 'status-inprogress'  },
    5: { label: 'Ready',         cssClass: 'status-ready'       },
    6: { label: 'Delivered',     cssClass: 'status-delivered'   },
    7: { label: 'Cancelled',     cssClass: 'status-cancelled'   },
  };

  // ── Lifecycle ─────────────────────────────────────────────────────────────

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
    if (this.toasterTimer) clearTimeout(this.toasterTimer);
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
        this.setError(
          err?.error?.message ?? 'Failed to load production request. Please try again.'
        );
      },
    });
  }

  /** Called after a successful payment to re-fetch latest status */
  refreshRequest(): void {
    if (!this.request) return;
    this.fetchRequest(this.request.id);
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

  /**
   * Show the payment section when:
   * - Status is "Quoted" (2)
   * - A quoted price exists
   * - Request is not cancelled
   */
  get showPaymentSection(): boolean {
    return (
      this.request?.status === 2 &&
      this.request?.quotedPrice != null &&
      !this.isCancelled
    );
  }

  // ── Format helpers ────────────────────────────────────────────────────────

  formatDate(dateStr?: string | null): string {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatCurrency(value?: number | null, currency = 'USD'): string {
    if (value == null) return '—';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
  }

  formatPaymentAmount(intentData: PaymentIntentData): string {
    const currency = intentData.currency?.toUpperCase() ?? 'EGP';
    // Stripe amounts are in the smallest currency unit (piastres for EGP)
    const amount = intentData.amount / 100;
    return `${currency} ${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)}`;
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
        this.showToaster(
          err?.error?.message ?? 'Failed to cancel request. Please try again.',
          'error'
        );
      },
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
        if (this.request) {
          this.request = { ...this.request, status: res.data?.status ?? 3 };
        }
        this.showToaster('Request confirmed successfully.', 'success');
      },
      error: (err) => {
        this.confirming = false;
        this.showToaster(
          err?.error?.message ?? 'Failed to confirm request. Please try again.',
          'error'
        );
      },
    });
  }

  // ── Payment flow ──────────────────────────────────────────────────────────

  /** Step 1: User clicks "Pay Now" → call backend to create a PaymentIntent */
  openPayment(): void {
    if (!this.request || this.paymentLoading) return;
    this.paymentError = '';
    this.paymentLoading = true;

    this.paymentService.createIntent(this.request.id).subscribe({
      next: (res) => {
        this.paymentLoading = false;

        if (!res.success || !res.data) {
          // Map known validation errors to friendly messages
          const raw = res.errors?.[0] ?? '';
          console.log(raw);
          this.paymentError = this.mapPaymentError(raw);
          return;
        }
        
        // Step 2: Open modal with the clientSecret
        this.paymentIntentData = res.data;
        this.showPaymentModal = true;
      },
      error: (err) => {
        this.paymentLoading = false;
        const raw = err?.error?.errors?.[0] ?? err?.error?.message ?? '';
        this.paymentError = this.mapPaymentError(raw);
      },
    });
  }

  /** Step 3: Modal signals payment succeeded */
  onPaymentSucceeded(): void {
    this.closePayment();
    this.showToaster('Payment completed successfully! 🎉', 'success');
    this.refreshRequest();
  }

  /** Close the payment modal */
  closePayment(): void {
    this.showPaymentModal = false;
    this.paymentIntentData = null;
    this.paymentError = '';
  }

  // ── Payment error mapping ─────────────────────────────────────────────────

  private mapPaymentError(raw: string): string {
    if (!raw) return 'Payment could not be processed. Please try again.';
    const lower = raw.toLowerCase();
    if (lower.includes('already been paid')) return 'This request has already been paid.';
    if (lower.includes('only available') || lower.includes('quoted'))
      return 'Payment is available only after a quotation has been issued.';
    return raw;
  }

  // ── Toaster ───────────────────────────────────────────────────────────────

  showToaster(message: string, type: 'success' | 'error'): void {
    if (this.toasterTimer) clearTimeout(this.toasterTimer);
    this.toaster = { message, type };
    this.toasterTimer = setTimeout(() => { this.toaster = null; }, 4000);
  }

  dismissToaster(): void {
    if (this.toasterTimer) clearTimeout(this.toasterTimer);
    this.toaster = null;
  }
}