// ─────────────────────────────────────────────────────────────────────────────
// Talentree · Cart Item Card Component
// ─────────────────────────────────────────────────────────────────────────────
import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartItem } from '../../../Core/services/cart-service.service';

@Component({
  selector: 'app-cart-item-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cart-item-card.component.html',
  styleUrls: ['./cart-item-card.component.scss'],
})
export class CartItemCardComponent {
  @Input({ required: true }) item!: CartItem;
  @Input() isUpdating = false;
  @Input() isRemoving = false;

  @Output() quantityChange = new EventEmitter<{ productId: number; quantity: number }>();
  @Output() removeItem = new EventEmitter<number>();

  imgError = signal(false);

  get stockLabel(): { text: string; level: 'ok' | 'low' | 'critical' } {
    const q = this.item.stockQuantity;
    if (q > 20) return { text: 'In stock', level: 'ok' };
    if (q > 5)  return { text: `Only ${q} left`, level: 'low' };
    return { text: `${q} remaining`, level: 'critical' };
  }

  onDecrease(): void {
    if (this.item.quantity <= 1 || this.isUpdating) return;
    this.quantityChange.emit({ productId: this.item.productId, quantity: this.item.quantity - 1 });
  }

  onIncrease(): void {
    if (this.item.quantity >= this.item.stockQuantity || this.isUpdating) return;
    this.quantityChange.emit({ productId: this.item.productId, quantity: this.item.quantity + 1 });
  }

  onRemove(): void {
    if (this.isRemoving) return;
    this.removeItem.emit(this.item.productId);
  }

  onImgError(): void {
    this.imgError.set(true);
  }
}