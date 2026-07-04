// ─────────────────────────────────────────────────────────────────────────────
// Talentree · co-order-details
// ─────────────────────────────────────────────────────────────────────────────
import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { CustomerOrdersService } from '../../../Core/services/customer-orders.service';
import { CoOrderItem, needsPayment } from '../../../Core/models/co-order.models';
import { CoPaymentModalComponent } from '../../../components/order/co-payment-modal/co-payment-modal.component';
import { CoCancelModalComponent } from '../../../components/order/co-cancel-modal/co-cancel-modal.component';
import { CoRefundModalComponent } from '../../../components/order/co-refund-modal/co-refund-modal.component';
import { CoInvoiceButtonComponent } from '../../../components/order/co-invoice-button/co-invoice-button.component';

type ActiveModal = 'cancel' | 'refund' | 'payment' | null;

@Component({
  selector: 'app-co-order-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CoPaymentModalComponent,
    CoCancelModalComponent,
    CoRefundModalComponent,
    CoInvoiceButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './co-order-details.component.html',
  styleUrls: ['./co-order-details.component.scss'],
})
export class CoOrderDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  protected readonly svc = inject(CustomerOrdersService);

  // Reactive route param — re-fires loadOrderDetails whenever the id changes,
  // including when Angular reuses this component instance across
  // order-details → order-details navigations (snapshot-based reads don't).
  readonly orderId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('id') ?? '' }
  );

  // Single discriminated slot for "which modal is open" instead of three
  // separate booleans — refundTargetItem is the only extra payload a modal
  // needs, so it stays as its own signal.
  readonly activeModal = signal<ActiveModal>(null);
  readonly refundTargetItem = signal<CoOrderItem | null>(null);

  readonly order = computed(() => this.svc.orderDetails());

  // Business rule lives in the model layer now — reused as-is here, and
  // available to any other page that needs the same check.
  readonly needsPayment = computed(() => needsPayment(this.order()));

  constructor() {
    // React to id changes (initial load + any future in-place navigation).
    // effect() isn't used here to avoid pulling in extra imports for a single
    // subscription; paramMap subscription with distinctUntilChanged-like
    // behavior from toSignal already avoids redundant fires on the same id.
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.svc.loadOrderDetails(id);
      }
    });
  }

  retry(): void {
    this.svc.loadOrderDetails(this.orderId());
  }

  openPaymentModal(): void {
    this.activeModal.set('payment');
  }

  closePaymentModal(): void {
    this.activeModal.set(null);
  }

  onPaymentSuccess(): void {
    this.activeModal.set(null);
    this.svc.refreshOrderDetails(this.orderId());
  }

  openCancelModal(): void {
    this.activeModal.set('cancel');
  }

  closeCancelModal(): void {
    this.activeModal.set(null);
  }

  onCancelConfirmed(): void {
    this.activeModal.set(null);
    // No manual refresh call needed — CustomerOrdersService.cancelOrder()
    // now refetches details internally when the cancelled order matches
    // the currently loaded one.
  }

  openRefundModal(item: CoOrderItem): void {
    this.refundTargetItem.set(item);
    this.activeModal.set('refund');
  }

  closeRefundModal(): void {
    this.activeModal.set(null);
    this.refundTargetItem.set(null);
  }

  onRefundSubmitted(): void {
    this.activeModal.set(null);
    this.refundTargetItem.set(null);
  }

  trackByItemId(_index: number, item: CoOrderItem): string {
    return item.id;
  }
}