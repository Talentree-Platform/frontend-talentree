// ─────────────────────────────────────────────────────────────────────────────
// Talentree · co-order-details
// ─────────────────────────────────────────────────────────────────────────────
import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CustomerOrdersService } from '../../../Core/services/customer-orders.service';
import { CoOrderItem } from '../../../Core/models/co-order.models';
import { CoPaymentModalComponent } from '../../../components/order/co-payment-modal/co-payment-modal.component';
import { CoCancelModalComponent } from '../../../components/order/co-cancel-modal/co-cancel-modal.component';
import { CoRefundModalComponent } from '../../../components/order/co-refund-modal/co-refund-modal.component';
import { CoInvoiceButtonComponent } from '../../../components/order/co-invoice-button/co-invoice-button.component';

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
export class CoOrderDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  protected readonly svc = inject(CustomerOrdersService);

  readonly orderId = signal<string>('');

  readonly showPaymentModal = signal(false);
  readonly showCancelModal = signal(false);
  readonly showRefundModal = signal(false);
  readonly refundTargetItem = signal<CoOrderItem | null>(null);

  readonly order = computed(() => this.svc.orderDetails());

  readonly needsPayment = computed(() => {
    const o = this.order();
    return !!o && (o.paymentStatus === 'unpaid' || o.paymentStatus === 'failed');
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.orderId.set(id);
      this.svc.loadOrderDetails(id);
    }
  }

  retry(): void {
    this.svc.loadOrderDetails(this.orderId());
  }

  openPaymentModal(): void {
    this.showPaymentModal.set(true);
  }

  closePaymentModal(): void {
    this.showPaymentModal.set(false);
  }

  onPaymentSuccess(): void {
    this.showPaymentModal.set(false);
    this.svc.refreshOrderDetails(this.orderId());
  }

  openCancelModal(): void {
    this.showCancelModal.set(true);
  }

  closeCancelModal(): void {
    this.showCancelModal.set(false);
  }

  onCancelConfirmed(): void {
    this.showCancelModal.set(false);
  }

  openRefundModal(item: CoOrderItem): void {
    this.refundTargetItem.set(item);
    this.showRefundModal.set(true);
  }

  closeRefundModal(): void {
    this.showRefundModal.set(false);
    this.refundTargetItem.set(null);
  }

  onRefundSubmitted(): void {
    this.showRefundModal.set(false);
    this.refundTargetItem.set(null);
  }

  trackByItemId(_index: number, item: CoOrderItem): string {
    return item.id;
  }
}
