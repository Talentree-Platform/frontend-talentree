// ─────────────────────────────────────────────────────────────────────────────
// Talentree · Customer Cart Page
// ─────────────────────────────────────────────────────────────────────────────
import {
  Component, OnInit, inject, ChangeDetectionStrategy, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CustomerCartService, ShippingAddress } from '../../../Core/services/cart-service.service';
import { ToastService } from '../../../Core/services/toast.service';
import { CustomerOrdersService } from '../../../Core/services/customer-orders.service';
import { CoCreateOrderRequest, CoCreateOrderResponse } from '../../../Core/models/co-order.models';
import { CartItemCardComponent } from '../../../components/cart/cart-item-card/cart-item-card.component';
import { CartSummaryCardComponent } from '../../../components/cart/cart-summary-card/cart-summary-card.component';
import { CartLoadingSkeletonComponent } from '../../../components/cart/cart-loading-skeleton/cart-loading-skeleton.component';
import { EmptyCartStateComponent } from '../../../components/cart/empty-cart-state/empty-cart-state.component';
import { CartErrorStateComponent } from '../../../components/cart/cart-error-state/cart-error-state.component';
import { CheckoutPreviewPanelComponent } from '../../../components/cart/checkout-preview-panal/checkout-preview-panal.component';

@Component({
  selector: 'app-customer-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CartItemCardComponent,
    CartSummaryCardComponent,
    CartLoadingSkeletonComponent,
    EmptyCartStateComponent,
    CartErrorStateComponent,
    CheckoutPreviewPanelComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './customer-cart.component.html',
  styleUrls: ['./customer-cart.component.scss'],
})
export class CustomerCartComponent implements OnInit {
  protected readonly cartSvc = inject(CustomerCartService);
  protected readonly ordersSvc = inject(CustomerOrdersService);
  private readonly toastSvc = inject(ToastService);
  private readonly router = inject(Router);

  readonly showCheckoutPreview = signal(false);
  readonly clearConfirmVisible = signal(false);

  ngOnInit(): void {
    this.cartSvc.loadCart();
  }

  onQuantityChange(e: { productId: number; quantity: number }): void {
    this.cartSvc.updateItemQuantity(e.productId, e.quantity).subscribe({
      error: () => this.toastSvc.error('Update failed', 'Could not change quantity. Please try again.'),
    });
  }

  onRemoveItem(productId: number): void {
    this.cartSvc.removeItem(productId).subscribe({
      next: () => this.toastSvc.success('Item removed', 'Removed from your cart.'),
      error: () => this.toastSvc.error('Remove failed', 'Could not remove item. Please try again.'),
    });
  }

  onClearCart(): void {
    this.clearConfirmVisible.set(true);
  }

  confirmClearCart(): void {
    this.clearConfirmVisible.set(false);
    this.cartSvc.clearCart().subscribe({
      next: () => this.toastSvc.success('Cart cleared', 'All items have been removed.'),
      error: () => this.toastSvc.error('Clear failed', 'Could not clear cart. Please try again.'),
    });
  }

  cancelClear(): void {
    this.clearConfirmVisible.set(false);
  }

  onProceedToCheckout(): void {
    this.showCheckoutPreview.set(true);
  }

  onClosePreview(): void {
    this.showCheckoutPreview.set(false);
  }

  onCheckoutPreviewRequested(address: ShippingAddress): void {
    this.cartSvc.loadCheckoutPreview(address);
  }

  onPlaceOrder(address: ShippingAddress): void {
    if (this.ordersSvc.checkoutSubmitting()) return; // guard against double-click

    const payload: CoCreateOrderRequest = {
      fullName: address.fullName,
      phoneNumber: address.phoneNumber,
      street: address.street,
      city: address.city,
      postalCode: address.postalCode,
      country: address.country,
    };

    // 'card' is the only confirmed payment-method code today (method=0).
    // Wire in a real selection here if a payment-method step gets added.
    this.ordersSvc.createOrder(payload, 'card').subscribe({
      next: (order: CoCreateOrderResponse) => {
        this.toastSvc.success('Order placed', `Order #${order.id} created successfully`);
        this.cartSvc.clearCart().subscribe();
        this.showCheckoutPreview.set(false);
        this.router.navigate(['/customer/orderDetails', order.id]);
      },
      error: () => {
        this.toastSvc.error('Order failed', this.ordersSvc.checkoutError() ?? 'Could not place order');
      },
    });
  }

  onRetry(): void {
    this.cartSvc.loadCart();
  }
}