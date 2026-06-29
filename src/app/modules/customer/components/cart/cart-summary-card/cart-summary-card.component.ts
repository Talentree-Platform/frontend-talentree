// ─────────────────────────────────────────────────────────────────────────────
// Talentree · Cart Summary Card Component
// ─────────────────────────────────────────────────────────────────────────────
import {
  Component, Input, Output, EventEmitter, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Cart } from '../../../Core/services/cart-service.service';

@Component({
  selector: 'app-cart-summary-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cart-summary-card.component.html',
  styleUrls: ['./cart-summary-card.component.scss'],
})
export class CartSummaryCardComponent {
  @Input({ required: true }) cart!: Cart;
  @Input() clearLoading = false;

  @Output() proceedToCheckout = new EventEmitter<void>();
  @Output() clearCart = new EventEmitter<void>();
}