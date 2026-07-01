import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { NgIf } from '@angular/common';
import { PaymentIntentData, PaymentError } from '../../../core/interfaces/payment';

// ── Stripe types (loaded via script tag or @stripe/stripe-js) ───────────────
declare const Stripe: any;

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [NgIf],
  templateUrl: './payment-modal.component.html',
  styleUrl: './payment-modal.component.scss',
})
export class PaymentModalComponent implements OnInit, OnDestroy {
  // ── Inputs ─────────────────────────────────────────────────────────────────
  /** Stripe publishable key — pass from environment */
  @Input({ required: true }) stripePublishableKey!: string;
  /** PaymentIntent data returned from the backend */
  @Input({ required: true }) intentData!: PaymentIntentData;
  /** Formatted amount string displayed in the UI, e.g. "EGP 1,000.00" */
  @Input() amountDisplay = '';

  // ── Outputs ────────────────────────────────────────────────────────────────
  @Output() closed = new EventEmitter<void>();
  @Output() succeeded = new EventEmitter<void>();
  @Output() paymentError = new EventEmitter<PaymentError>();

  // ── Internal state ─────────────────────────────────────────────────────────
  mountingElements = true; /** true while Stripe Elements are initialising */
  processing = false;      /** true while confirmPayment() is in-flight     */
  errorMessage = '';

  private stripe: any = null;
  private elements: any = null;
  private paymentElement: any = null;

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.initStripe();
  }

  ngOnDestroy(): void {
    this.destroyPaymentElement();
  }

  // ── Stripe initialisation ──────────────────────────────────────────────────

  private async initStripe(): Promise<void> {
    if (typeof Stripe === 'undefined') {
      this.errorMessage = 'Stripe.js failed to load. Please refresh the page.';
      this.mountingElements = false;
      return;
    }

    try {
      this.stripe = Stripe(this.stripePublishableKey);

      this.elements = this.stripe.elements({
        clientSecret: this.intentData.clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#C9A84C',
            colorBackground: '#fffdf7',
            colorText: '#2a1f0a',
            colorDanger: '#ef4444',
            fontFamily: 'Inter, system-ui, sans-serif',
            borderRadius: '10px',
            spacingUnit: '4px',
          },
        },
      });

      this.paymentElement = this.elements.create('payment');

      // Wait a tick for the DOM node to exist
      setTimeout(() => {
        const mountPoint = document.getElementById('pmt-stripe-element');
        if (mountPoint) {
          this.paymentElement.mount(mountPoint);
        }
        this.mountingElements = false;
      }, 0);
    } catch (err) {
      console.error('[PaymentModal] initStripe error:', err);
      this.errorMessage = 'Failed to initialise payment form. Please try again.';
      this.mountingElements = false;
    }
  }

  private destroyPaymentElement(): void {
    if (this.paymentElement) {
      try { this.paymentElement.destroy(); } catch { /* ignore */ }
      this.paymentElement = null;
    }
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  async submit(): Promise<void> {
    if (this.processing || this.mountingElements || !this.stripe || !this.elements) return;

    this.processing = true;
    this.errorMessage = '';

    const { error } = await this.stripe.confirmPayment({
      elements: this.elements,
      confirmParams: {
        // No redirect — we handle the result ourselves
        return_url: window.location.href,
      },
      redirect: 'if_required',
    });

    if (error) {
      this.processing = false;
      if (error.type === 'card_error' || error.type === 'validation_error') {
        this.errorMessage = error.message ?? 'Card error. Please check your details.';
      } else {
        this.errorMessage = 'An unexpected error occurred. Please try again.';
      }
    } else {
      // Payment succeeded
      this.processing = false;
      this.succeeded.emit();
    }
  }

  close(): void {
    if (this.processing) return; // don't allow closing mid-payment
    this.closed.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('pmt-overlay')) {
      this.close();
    }
  }
}