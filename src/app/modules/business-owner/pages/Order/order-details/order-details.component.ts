import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { MaterialOrderDetails } from '../../../core/interfaces/i-material-order';
import { MaterialOrderService } from '../../../core/services/material-order.service';
import { PaymentService } from '../../../core/services/payment.service';
import { PaymentIntentData, PaymentError } from '../../../core/interfaces/payment';
import { PaymentModalComponent } from '../../../components/payment-modal/payment-modal/payment-modal.component';
import { environment } from '../../../../../core/environment/envirinment';

@Component({
  selector: 'app-material-order-details',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, PaymentModalComponent],
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss']
})
export class MaterialOrderDetailsComponent implements OnInit {

  private activatedRoute = inject(ActivatedRoute);
  private materialOrderService = inject(MaterialOrderService);
  private paymentService = inject(PaymentService);

  orderDetails!: MaterialOrderDetails;

  // ── Payment state ───────────────────────────────────────────────────────
  readonly stripePublishableKey = environment.stripePublishableKey;

  showPaymentModal = false;
  creatingIntent = false;
  intentError = '';
  intentData: PaymentIntentData | null = null;
  paymentAmountDisplay = '';

  ngOnInit(): void {

    const id = Number(this.activatedRoute.snapshot.paramMap.get('id'));

    this.getOrderDetails(id);
  }

  getOrderDetails(id: number): void {

    this.materialOrderService.getOrderById(id).subscribe({

      next: (res) => {

        console.log(res);

        this.orderDetails = res.data;
      },

      error: (err) => {
        console.log(err);
      }

    });
  }

  getStatus(status: number): string {

    switch (status) {

      case 0:
        return 'Pending';

      case 1:
        return 'Processing';

      case 2:
        return 'Delivered';

      case 3:
        return 'Cancelled';

      default:
        return 'Unknown';
    }
  }

  getPaymentStatus(status: number): string {

    switch (status) {

      case 0:
        return 'Unpaid';

      case 1:
        return 'Paid';

      default:
        return 'Unknown';
    }
  }

  // ── Payment flow ─────────────────────────────────────────────────────────

  openPaymentModal(): void {
    if (!this.orderDetails || this.creatingIntent) return;

    this.intentError = '';
    this.creatingIntent = true;

    this.paymentService.createMaterialOrderIntent(this.orderDetails.id).subscribe({
      next: (res) => {
        this.creatingIntent = false;

        if (res.success && res.data) {
          this.intentData = res.data;
          this.paymentAmountDisplay = `${res.data.amount} ${res.data.currency.toUpperCase()}`;
          this.showPaymentModal = true;
        } else {
          this.intentError = res.errors?.[0] ?? 'Unable to start payment. Please try again.';
        }
      },
      error: (err) => {
        this.creatingIntent = false;
        console.log(err);

        if (err?.status === 409) {
          this.intentError = 'This order has already been paid.';
        } else {
          this.intentError = 'Unable to start payment. Please try again.';
        }
      }
    });
  }

  onPaymentModalClosed(): void {
    this.showPaymentModal = false;
    this.intentData = null;
  }

  onPaymentSucceeded(): void {
    this.showPaymentModal = false;
    this.intentData = null;

    // Optimistically reflect paid status, then refresh from server to be sure
    if (this.orderDetails) {
      this.orderDetails.paymentStatus = 1;
    }
    this.getOrderDetails(this.orderDetails.id);
  }

  onPaymentError(error: PaymentError): void {
    console.log(error);
    this.intentError = error.message;
  }
}