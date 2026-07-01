// ─────────────────────────────────────────────────────────────────────────────
// Talentree · co-payment-modal
// Reuses the same lazy-loaded Stripe.js + PaymentService pattern as
// production requests / material orders.
// ─────────────────────────────────────────────────────────────────────────────
import {
  Component, OnInit, OnDestroy, Input, Output, EventEmitter,
  inject, signal, ViewChild, ElementRef, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../../Core/services/payment.service';

type PayPhase = 'loading' | 'ready' | 'processing' | 'success' | 'error';

@Component({
  selector: 'app-co-payment-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './co-payment-modal.component.html',
  styleUrls: ['./co-payment-modal.component.scss'],
})
export class CoPaymentModalComponent implements OnInit, OnDestroy {
  @Input({ required: true }) orderId!: string;
  @Input({ required: true }) amount!: number;
  @Input({ required: true }) currency!: string;

  @Output() closed = new EventEmitter<void>();
  @Output() succeeded = new EventEmitter<void>();

  @ViewChild('cardElementRef') cardElementRef!: ElementRef<HTMLDivElement>;

  // Only one service needed now — PaymentService owns both Stripe loading
  // and the customer order payment-intent call.
  private readonly paymentSvc = inject(PaymentService);

  readonly phase = signal<PayPhase>('loading');
  readonly errorMessage = signal<string | null>(null);

  private stripe: any = null;
  private elements: any = null;
  private cardElement: any = null;
  private clientSecret: string | null = null;

  async ngOnInit(): Promise<void> {
    try {
      await this.paymentSvc.loadStripeJs();
      this.stripe = this.paymentSvc.getStripeInstance();

      this.paymentSvc.createCustomerOrderPaymentIntent(this.orderId).subscribe({
        next: (data) => {
          // data is already unwrapped: { paymentMethod, stripeClientSecret, orderId }
          this.clientSecret = data.stripeClientSecret;
          this.mountCardElement();
          this.phase.set('ready');
        },
        error: () => {
          this.errorMessage.set('Could not initialize payment. Please try again.');
          this.phase.set('error');
        },
      });
    } catch {
      this.errorMessage.set('Payment system failed to load.');
      this.phase.set('error');
    }
  }

  ngOnDestroy(): void {
    this.cardElement?.destroy?.();
  }

  private mountCardElement(): void {
    if (!this.stripe) return;
    this.elements = this.stripe.elements();
    this.cardElement = this.elements.create('card', {
      style: {
        base: {
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '14px',
          color: '#18130A',
          '::placeholder': { color: '#A09280' },
        },
        invalid: { color: '#D94040' },
      },
    });
    // Mounted after view renders 'ready' phase — see template ngAfterViewInit pattern below
    setTimeout(() => {
      if (this.cardElementRef?.nativeElement) {
        this.cardElement.mount(this.cardElementRef.nativeElement);
      }
    });
  }

  async confirmPayment(): Promise<void> {
    if (!this.stripe || !this.clientSecret) return;

    this.phase.set('processing');
    this.errorMessage.set(null);

    const result = await this.stripe.confirmCardPayment(this.clientSecret, {
      payment_method: { card: this.cardElement },
    });

    if (result.error) {
      this.errorMessage.set(result.error.message ?? 'Payment failed. Please try again.');
      this.phase.set('error');
      return;
    }

    if (result.paymentIntent?.status === 'succeeded') {
      this.phase.set('success');
      setTimeout(() => this.succeeded.emit(), 1100);
    } else {
      this.errorMessage.set('Payment could not be completed.');
      this.phase.set('error');
    }
  }

  retry(): void {
    this.phase.set('ready');
    this.errorMessage.set(null);
  }

  close(): void {
    if (this.phase() === 'processing') return; // prevent dismiss mid-payment
    this.closed.emit();
  }
}