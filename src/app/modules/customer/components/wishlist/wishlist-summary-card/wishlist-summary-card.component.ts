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
      <a routerLink="/customer/customerProduct" class="wishlist-summary__continue">
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
    :host {
      --gold:        var(--bo-accent);
      --gold-light:  #c9952a;
      --gold-soft:   var(--bo-accent-soft);
      --text-dark:   var(--bo-color-text);
      --text-mid:    var(--bo-color-text-muted);
      --text-soft:   var(--bo-color-text-muted);
    }

    .wishlist-summary {
      background: var(--bo-bg-surface);
      border: var(--bo-border-surface);
      border-radius: 18px;
      overflow: hidden;
      box-shadow: var(--bo-shadow-card);
    }

    .wishlist-summary__header {
      padding: 20px 22px 16px;
      background: var(--bo-hero-bg);
      border-bottom: var(--bo-border-surface);
    }

    .wishlist-summary__title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: 'Cormorant Garamond', serif;
      font-size: 20px;
      font-weight: 600;
      color: var(--text-dark);
      margin: 0;

      svg {
        width: 17px;
        height: 17px;
        color: var(--gold);
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
      color: var(--text-soft);
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
      color: var(--text-mid);
    }

    .wishlist-summary__total-value {
      font-family: 'Cormorant Garamond', serif;
      font-size: 22px;
      font-weight: 700;
      color: var(--text-dark);
    }

    .wishlist-summary__divider {
      height: 1px;
      background: var(--bo-border-surface-hover);
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
      background-image: var(--bo-accent-gradient);
      color: var(--bo-color-on-accent);
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: box-shadow 0.25s, transform 0.25s, opacity 0.2s;

      svg { width: 14px; height: 14px; }

      &:hover:not(:disabled) {
        box-shadow: var(--bo-shadow-card-hover);
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
      border: var(--bo-border-surface);
      background: transparent;
      color: var(--text-mid);
      font-family: 'DM Sans', sans-serif;
      font-size: 12px;
      font-weight: 600;
      text-decoration: none;
      transition: border-color 0.2s, background 0.2s;

      svg { width: 13px; height: 13px; }

      &:hover {
        border-color: var(--bo-border-surface-hover);
        background: var(--gold-soft);
      }
    }

    .wishlist-summary__note {
      font-family: 'DM Sans', sans-serif;
      font-size: 11px;
      color: var(--text-soft);
      text-align: center;
      line-height: 1.5;
      padding: 14px 22px 20px;
      margin: 0;
    }

    .btn-spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(31, 21, 10, 0.35);
      border-top-color: var(--bo-color-on-accent);
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