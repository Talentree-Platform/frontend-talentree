import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, signal, computed, inject
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../Core/models/customer,models';
import { CustomerMarketplaceService } from '../../Core/services/customer-marketplace.service';

@Component({
  selector: 'app-customer-product-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './customer-product-card.component.html',
  styleUrls: ['./customer-product-card.component.scss'],
})
export class CustomerProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Input() skeleton = false;
  @Output() addedToCart = new EventEmitter<{ productId: string; qty: number }>();

  private readonly svc = inject(CustomerMarketplaceService);

  readonly qty = signal(1);

  readonly cartQty = computed(() => this.svc.getCartQty(this.product?.id ?? ''));
  readonly inCart  = computed(() => this.cartQty() > 0);

  readonly discountPct = computed(() => {
    if (!this.product?.originalPrice || !this.product?.price) return null;
    return Math.round(
      ((this.product.originalPrice - this.product.price) / this.product.originalPrice) * 100
    );
  });

  increment(): void {
    if (this.qty() < (this.product?.stockQuantity ?? 99)) {
      this.qty.update(v => v + 1);
    }
  }

  decrement(): void {
    if (this.qty() > 1) this.qty.update(v => v - 1);
  }

  addToCart(): void {
    if (!this.product?.isAvailable) return;
    this.svc.addToCart(this.product.id, this.qty());
    this.addedToCart.emit({ productId: this.product.id, qty: this.qty() });
    this.qty.set(1);
  }

  get stars(): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  ratingFill(star: number): 'full' | 'half' | 'empty' {
    const r = this.product?.rating ?? 0;
    if (star <= Math.floor(r)) return 'full';
    if (star === Math.ceil(r) && r % 1 >= 0.5) return 'half';
    return 'empty';
  }
}