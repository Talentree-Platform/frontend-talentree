// ─────────────────────────────────────────────────────────────────────────────
// Talentree · co-checkout — Create Order
// ─────────────────────────────────────────────────────────────────────────────
import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomerOrdersService, CoPaymentMethodParam } from '../../../Core/services/customer-orders.service';
import { CoCheckoutSummary, CoCreateOrderRequest } from '../../../Core/models/co-order.models';
import { CustomerCartService } from '../../../Core/services/cart-service.service';

type CheckoutPhase = 'form' | 'submitting' | 'success';

@Component({
  selector: 'app-co-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './co-checkout.component.html',
  styleUrls: ['./co-checkout.component.scss'],
})
export class CoCheckoutComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly cart = inject(CustomerCartService);
  protected readonly ordersSvc = inject(CustomerOrdersService);

  readonly phase = signal<CheckoutPhase>('form');
  readonly selectedMethod = signal<CoPaymentMethodParam>('card');

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9+\s-]{8,15}$/)]],
    street: ['', [Validators.required, Validators.minLength(3)]],
    city: ['', [Validators.required]],
    postalCode: ['', [Validators.required]],
    country: ['Egypt', [Validators.required]],
  });

  // Order summary pulled from cart — adapt to your actual CartService shape
  readonly summary = computed<CoCheckoutSummary>(() => {
    const items = this.cart.cart()?.items || [];
    const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const shippingFee = subtotal > 0 ? 75 : 0;
    const taxAmount = Math.round(subtotal * 0.0); // adjust if tax applies
    const discount = 0;
    return {
      items: items.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        imageUrl: i.productImageUrl ?? null,
        sellerName: i.sellerName,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        lineTotal: i.unitPrice * i.quantity,
      })),
      subtotal,
      shippingFee,
      taxAmount,
      discount,
      total: subtotal + shippingFee + taxAmount - discount,
      currency: 'EGP',
    };
  });

  readonly isEmpty = computed(() => this.summary().items.length === 0);

  readonly paymentMethods: { value: CoPaymentMethodParam; label: string; icon: string }[] = [
    { value: 'card', label: 'Credit / Debit Card', icon: 'card' },
    { value: 'wallet', label: 'Digital Wallet', icon: 'wallet' },
    { value: 'cash_on_delivery', label: 'Cash on Delivery', icon: 'cash' },
  ];

  ngOnInit(): void {
    this.ordersSvc.resetCheckoutError();
  }

  selectMethod(method: CoPaymentMethodParam): void {
    this.selectedMethod.set(method);
  }

  field(name: keyof typeof this.form.controls) {
    return this.form.controls[name];
  }

  showError(name: keyof typeof this.form.controls): boolean {
    const ctrl = this.field(name);
    return ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  submit(): void {
    if (this.form.invalid || this.isEmpty()) {
      this.form.markAllAsTouched();
      return;
    }

    this.phase.set('submitting');

    const payload: CoCreateOrderRequest = this.form.getRawValue();

    this.ordersSvc.createOrder(payload, this.selectedMethod()).subscribe({
      next: (res) => {
        this.phase.set('success');
        this.cart.clearCart().subscribe();
        // Brief success transition before navigating, matches payment-success pattern
        setTimeout(() => {
          this.router.navigate(['/marketplace/orders', res.orderId]);
        }, 900);
      },
      error: () => {
        this.phase.set('form');
      },
    });
  }
}
