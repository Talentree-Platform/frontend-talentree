// ─────────────────────────────────────────────────────────────────────────────
// Talentree · Wishlist Summary Card (sidebar panel)
// ─────────────────────────────────────────────────────────────────────────────
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Wishlist } from '../../../Core/services/wishlist.service';

@Component({
  selector: 'app-wishlist-summary-card',
  standalone: true,
  imports: [CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wishlist-summary">

      <div class="wishlist-summary__header">
        <h2 class="wishlist-summary__title">
          <svg viewBox="0 0 18 18" fill="none">
            <path d="M9 15s-6-4-6-8a4 4 0 0 1 6-3.46A4 4 0 0 1 15 7c0 4-6 8-6 8z"
              stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
          </svg>
          Wishlist Summary
        </h2>
      </div>

      <!-- Item count -->
      <div class="wishlist-summary__meta">
        <span class="wishlist-summary__count">
          {{ wishlist.items.length }}
          {{ wishlist.items.length === 1 ? 'item' : 'items' }} saved
        </span>
      </div>

      <!-- Total value -->
      <div class="wishlist-summary__total-row">
        <span class="wishlist-summary__total-label">Total Value</span>
        <span class="wishlist-summary__total-value">
          {{ totalValue | currency:'EGP':'symbol':'1.2-2' }}
        </span>
      </div>

      <div class="wishlist-summary__divider"></div>

      <!-- Move all to cart -->
      <button
        class="wishlist-summary__move-btn"
        (click)="moveAllToCart.emit()"
        [disabled]="moveToCartLoading || wishlist.items.length === 0"
      >
        @if (moveToCartLoading) {
          <span class="btn-spinner"></span>
          Moving to cart…
        } @else {
          <svg viewBox="0 0 16 16" fill="none">
            <path d="M2 2h2l2.5 8h6l2-5H5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="7" cy="13" r="1" fill="currentColor"/>
            <circle cx="12" cy="13" r="1" fill="currentColor"/>
          </svg>
          Move All to Cart
        }
      </button>

      <!-- Continue shopping link -->
      <a routerLink="/marketplace/products" class="wishlist-summary__continue">
        <svg viewBox="0 0 16 16" fill="none">
          <path d="M10 3L4 8l6 5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Continue Shopping
      </a>

      <!-- Info note -->
      <p class="wishlist-summary__note">
        Items are not reserved. Add them to cart to secure your order.
      </p>

    </div>
  `,
  styles: [`
    $gold:        #B8860B;
    $gold-light:  #C9952A;
    $gold-pale:   #FBF3E2;
    $gold-border: #E8D5A3;
    $text-dark:   #18130A;
    $text-mid:    #5C5244;
    $text-soft:   #A09280;

    .wishlist-summary {
      background: #fff;
      border: 1px solid $gold-border;
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 2px 20px rgba($gold, 0.07);
    }

    .wishlist-summary__header {
      padding: 20px 22px 16px;
      background: linear-gradient(135deg, #1a1108 0%, #2e1f06 100%);
      border-bottom: 1px solid rgba($gold, 0.2);
    }

    .wishlist-summary__title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: 'Cormorant Garamond', serif;
      font-size: 20px;
      font-weight: 600;
      color: #fff;
      margin: 0;

      svg {
        width: 17px;
        height: 17px;
        color: $gold-light;
        flex-shrink: 0;
      }
    }

    .wishlist-summary__meta {
      padding: 16px 22px 0;
    }

    .wishlist-summary__count {
      font-family: 'DM Sans', sans-serif;
      font-size: 12px;
      font-weight: 600;
      color: $text-soft;
      text-transform: uppercase;
      letter-spacing: 0.07em;
    }

    .wishlist-summary__total-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 12px 22px 16px;
    }

    .wishlist-summary__total-label {
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      color: $text-mid;
    }

    .wishlist-summary__total-value {
      font-family: 'Cormorant Garamond', serif;
      font-size: 22px;
      font-weight: 700;
      color: $text-dark;
    }

    .wishlist-summary__divider {
      height: 1px;
      background: $gold-border;
      margin: 0 22px;
    }

    .wishlist-summary__move-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: calc(100% - 44px);
      margin: 18px 22px 0;
      height: 46px;
      border-radius: 40px;
      border: none;
      background: linear-gradient(135deg, $gold, $gold-light);
      color: #fff;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: box-shadow 0.25s, transform 0.25s, opacity 0.2s;

      svg { width: 14px; height: 14px; }

      &:hover:not(:disabled) {
        box-shadow: 0 6px 20px rgba($gold, 0.4);
        transform: translateY(-1px);
      }

      &:disabled { opacity: 0.55; cursor: not-allowed; }
    }

    .wishlist-summary__continue {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      margin: 12px 22px 0;
      height: 38px;
      border-radius: 30px;
      border: 1.5px solid $gold-border;
      background: transparent;
      color: $text-mid;
      font-family: 'DM Sans', sans-serif;
      font-size: 12px;
      font-weight: 600;
      text-decoration: none;
      transition: border-color 0.2s, background 0.2s;

      svg { width: 13px; height: 13px; }

      &:hover {
        border-color: $gold;
        background: $gold-pale;
      }
    }

    .wishlist-summary__note {
      font-family: 'DM Sans', sans-serif;
      font-size: 11px;
      color: $text-soft;
      text-align: center;
      line-height: 1.5;
      padding: 14px 22px 20px;
      margin: 0;
    }

    .btn-spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.35);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.65s linear infinite;
      display: inline-block;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class WishlistSummaryCardComponent {
  @Input({ required: true }) wishlist!: Wishlist;
  @Input() moveToCartLoading = false;

  @Output() moveAllToCart = new EventEmitter<void>();

  get totalValue(): number {
    return this.wishlist.items.reduce((sum, i) => sum + i.productPrice, 0);
  }
}