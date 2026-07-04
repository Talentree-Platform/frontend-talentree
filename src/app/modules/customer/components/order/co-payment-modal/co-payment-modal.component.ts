// ─────────────────────────────────────────────────────────────────────────────
// Talentree · co-payment-modal
// Reuses the same lazy-loaded Stripe.js + PaymentService pattern as
// production requests / material orders.
// ─────────────────────────────────────────────────────────────────────────────
import {
  Component, OnInit, OnDestroy, Input, Output, EventEmitter,
  inject, signal, effect, viewChild, ElementRef, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../../Core/services/payment.service';
import { OrderStatus, PaymentStatus } from '../../../Core/models/co-order.models';

type PayPhase = 'loading' | 'ready' | 'processing' | 'success' | 'error' | 'blocked';

// How long we wait for Stripe's confirmCardPayment before giving up on the
// UI side. Stripe's own request may still resolve later — the requestToken
// guard below ignores that late resolution rather than trying to cancel it.
const PAYMENT_TIMEOUT_MS = 30000;

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

  // New: lets the modal refuse to open a payment attempt against an order
  // that's already paid/refunded/cancelled, without touching any backend
  // contract. Parent (co-order-details) passes these from the order it
  // already has loaded.
  @Input() paymentStatus: PaymentStatus | null = null;
  @Input() orderStatus: OrderStatus | null = null;

  @Output() closed = new EventEmitter<void>();
  @Output() succeeded = new EventEmitter<void>();

  // Signal-based view query — replaces the old @ViewChild + setTimeout mount.
  // The effect() below reacts the instant this element actually exists in
  // the DOM (i.e. once the @if in the template switches to the 'ready'
  // branch), so there's no fragile timing guess.
  private readonly cardElementRef = viewChild<ElementRef<HTMLDivElement>>('cardElementRef');

  private readonly paymentSvc = inject(PaymentService);

  readonly phase = signal<PayPhase>('loading');
  readonly errorMessage = signal<string | null>(null);
  readonly blockedMessage = signal<string | null>(null);

  private stripe: any = null;
  private elements: any = null;
  private cardElement: any = null;
  private clientSecret: string | null = null;
  private mounted = false;

  // Guards against stale async work: bumped on every new payment-intent
  // fetch and every confirm attempt, so a late-arriving response from a
  // previous retry/attempt can never overwrite newer state.
  private requestToken = 0;
  private confirmToken = 0;

  // Synchronous lock so a rapid double-click can't fire confirmPayment()
  // twice before Angular has a chance to re-render the disabled button.
  private submitLock = false;

  constructor() {
    effect(() => {
      const el = this.cardElementRef();
      if (el && this.phase() === 'ready' && !this.mounted) {
        this.mountCardElement(el.nativeElement);
      }
    });
  }

  ngOnInit(): void {
    const blocked = this.computeBlockedMessage();
    if (blocked) {
      this.blockedMessage.set(blocked);
      this.phase.set('blocked');
      return; // never call createCustomerOrderPaymentIntent for a blocked order
    }
    this.initPaymentIntent();
  }

  ngOnDestroy(): void {
    // Invalidate any in-flight init/confirm work before tearing down refs.
    this.requestToken++;
    this.confirmToken++;
    this.destroyCardElement();
    this.stripe = null;
    this.clientSecret = null;
  }

  // ── Payment intent lifecycle ─────────────────────────────────────────────

  private async initPaymentIntent(): Promise<void> {
    this.phase.set('loading');
    this.errorMessage.set(null);
    const attempt = ++this.requestToken;

    try {
      if (!this.stripe) {
        await this.paymentSvc.loadStripeJs();
        this.stripe = this.paymentSvc.getStripeInstance();
      }

      this.paymentSvc.createCustomerOrderPaymentIntent(this.orderId).subscribe({
        next: (data) => {
          if (attempt !== this.requestToken) return; // superseded by a newer retry
          this.clientSecret = data.stripeClientSecret;
          this.mounted = false; // allow the effect to mount fresh element
          this.phase.set('ready');
        },
        error: () => {
          if (attempt !== this.requestToken) return;
          this.errorMessage.set('Could not initialize payment. Please try again.');
          this.phase.set('error');
        },
      });
    } catch {
      if (attempt !== this.requestToken) return;
      this.errorMessage.set('Payment system failed to load.');
      this.phase.set('error');
    }
  }

  private mountCardElement(container: HTMLDivElement): void {
    if (!this.stripe || this.mounted) return;

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
    this.cardElement.mount(container);
    this.mounted = true;
  }

  private destroyCardElement(): void {
    this.cardElement?.destroy?.();
    this.cardElement = null;
    this.elements = null;
    this.mounted = false;
  }

  // ── Actions ──────────────────────────────────────────────────────────────

  async confirmPayment(): Promise<void> {
    if (this.submitLock) return;
    if (this.phase() !== 'ready') return;
    if (!this.stripe || !this.clientSecret || !this.cardElement) return;

    this.submitLock = true;
    const attempt = ++this.confirmToken;
    this.phase.set('processing');
    this.errorMessage.set(null);

    let timedOut = false;
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        timedOut = true;
        reject(new Error('payment-timeout'));
      }, PAYMENT_TIMEOUT_MS);
    });

    try {
      const result = await Promise.race([
        this.stripe.confirmCardPayment(this.clientSecret, {
          payment_method: { card: this.cardElement },
        }),
        timeoutPromise,
      ]);

      if (attempt !== this.confirmToken) return; // a retry superseded this attempt

      if (result.error) {
        this.errorMessage.set(this.mapStripeError(result.error));
        this.phase.set('error');
        return;
      }

      if (result.paymentIntent?.status === 'succeeded') {
        this.phase.set('success');
        // Parent listens on `succeeded` to refresh order details; the
        // modal itself is removed from the DOM by the parent's @if once
        // it decides the refresh is done (see note below the HTML).
        setTimeout(() => this.succeeded.emit(), 1100);
      } else {
        this.errorMessage.set('Payment could not be completed.');
        this.phase.set('error');
      }
    } catch {
      if (attempt !== this.confirmToken) return;
      this.errorMessage.set(
        timedOut
          ? 'Payment is taking longer than expected. Please try again.'
          : 'Payment failed. Please try again.'
      );
      this.phase.set('error');
    } finally {
      this.submitLock = false;
    }
  }

  async retry(): Promise<void> {
    if (this.phase() === 'blocked' || this.phase() === 'success') return;

    // A fresh attempt needs a fresh PaymentIntent, not just a UI reset —
    // the old clientSecret may already be spent/expired.
    this.destroyCardElement();
    this.clientSecret = null;
    await this.initPaymentIntent();
  }

  close(): void {
    if (this.phase() === 'processing') return; // prevent dismiss mid-payment
    this.closed.emit();
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private computeBlockedMessage(): string | null {
    if (this.paymentStatus === 'paid') {
      return 'This order has already been paid.';
    }
    if (this.paymentStatus === 'refunded') {
      return 'This order has been refunded and cannot be paid again.';
    }
    if (this.orderStatus === 'cancelled') {
      return 'This order was cancelled and can no longer be paid.';
    }
    return null;
  }

  private mapStripeError(error: any): string {
    const code = error?.code ?? '';
    const type = error?.type ?? '';
    const message = (error?.message ?? '').toLowerCase();

    if (code === 'payment_intent_unexpected_state') {
      return 'This payment session is no longer valid. Please retry to start a new one.';
    }
    if (type === 'authentication_error' || code === 'authentication_required') {
      return 'We could not verify your card with your bank. Please try again.';
    }
    if (code === 'payment_intent_expired' || message.includes('expired')) {
      return 'Your payment session expired. Please retry to start a new one.';
    }
    return error?.message ?? 'Payment failed. Please try again.';
  }
}