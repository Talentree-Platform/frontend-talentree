// ─────────────────────────────────────────────────────────────────────────────
// Talentree · Wishlist Item Card Component
// ─────────────────────────────────────────────────────────────────────────────
import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { WishlistItem } from '../../../Core/services/wishlist.service';

@Component({
  selector: 'app-wishlist-item-card',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Wishlist Item Card -->
    <div class="wishlist-item" [class.wishlist-item--removing]="isRemoving">

      <!-- Product Image -->
      <div class="wishlist-item__img-wrap">
        @if (item.productImageUrl && !imgError()) {
          <img
            [src]="item.productImageUrl"
            [alt]="item.productName"
            class="wishlist-item__img"
            loading="lazy"
            (error)="onImgError()"
          />
        } @else {
          <div class="wishlist-item__img-placeholder">
            <svg viewBox="0 0 40 40" fill="none">
              <rect x="6" y="6" width="28" height="28" rx="4" stroke="currentColor" stroke-width="1.5"/>
              <circle cx="15" cy="15" r="3" stroke="currentColor" stroke-width="1.5"/>
              <path d="M6 26l8-7 6 5 4-4 10 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        }
      </div>

      <!-- Info -->
      <div class="wishlist-item__info">
        <p class="wishlist-item__brand">{{ item.productBrandName }}</p>
        <h3 class="wishlist-item__name">{{ item.productName }}</h3>
        <p class="wishlist-item__price">
          {{ item.productPrice | currency:'EGP':'symbol':'1.2-2' }}
        </p>

        <div class="wishlist-item__stock" [class]="'wishlist-item__stock--' + stockLabel().level">
          <span class="stock-dot"></span>
          {{ stockLabel().text }}
        </div>

        <p class="wishlist-item__added">
          Added {{ item.addedAt | date:'MMM d, y' }}
        </p>
      </div>

      <!-- Actions -->
      <div class="wishlist-item__actions">
        <!-- Add to Cart -->
        <button
          class="wishlist-item__add-to-cart"
          (click)="addToCart.emit(item.productId)"
          [disabled]="isRemoving || item.productStockQuantity === 0"
          [title]="item.productStockQuantity === 0 ? 'Out of stock' : 'Add to cart'"
        >
          <svg viewBox="0 0 16 16" fill="none">
            <path d="M2 2h2l2.5 8h6l2-5H5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="7" cy="13" r="1" fill="currentColor"/>
            <circle cx="12" cy="13" r="1" fill="currentColor"/>
          </svg>
          Add to Cart
        </button>

        <!-- Remove from Wishlist -->
        <button
          class="wishlist-item__remove"
          (click)="onRemove()"
          [disabled]="isRemoving"
          [attr.aria-label]="'Remove ' + item.productName + ' from wishlist'"
        >
          @if (isRemoving) {
            <span class="remove-spinner"></span>
          } @else {
            <svg viewBox="0 0 16 16" fill="none">
              <path d="M3 4h10M5 4V3h6v1M6 7v5M10 7v5M4 4l.7 9h6.6L12 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          }
        </button>
      </div>

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
      --danger:      #D94040;
      --success:     #27A06B;
      --warning:     #c9952a;
    }
    $bp-sm:       600px;

    .wishlist-item {
      display: grid;
      grid-template-columns: 90px 1fr auto;
      gap: 20px;
      align-items: center;
      padding: 20px 24px;
      border-bottom: var(--bo-border-surface);
      transition: background 0.2s, opacity 0.3s;
      position: relative;

      &:last-child { border-bottom: none; }
      &:hover { background: var(--bo-bg-surface-hover); }

      &--removing {
        opacity: 0.45;
        pointer-events: none;
      }

      @media (max-width: $bp-sm) {
        grid-template-columns: 70px 1fr;
        grid-template-rows: auto auto;
        gap: 12px;
        padding: 16px;
      }
    }

    // ── Image ─────────────────────────────────────────────────────────────────
    .wishlist-item__img-wrap {
      width: 90px;
      height: 90px;
      border-radius: 12px;
      overflow: hidden;
      flex-shrink: 0;
      border: var(--bo-border-surface);

      @media (max-width: $bp-sm) { width: 70px; height: 70px; }
    }

    .wishlist-item__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;

      .wishlist-item:hover & { transform: scale(1.04); }
    }

    .wishlist-item__img-placeholder {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, var(--bo-accent-soft), var(--bo-bg-surface));
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-soft);

      svg { width: 32px; height: 32px; }
    }

    // ── Info ──────────────────────────────────────────────────────────────────
    .wishlist-item__info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .wishlist-item__brand {
      font-family: 'DM Sans', sans-serif;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--gold);
      margin: 0;
    }

    .wishlist-item__name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 17px;
      font-weight: 600;
      color: var(--text-dark);
      margin: 0;
      line-height: 1.3;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .wishlist-item__price {
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      font-weight: 700;
      color: var(--text-dark);
      margin: 4px 0 2px;
    }

    // Stock indicator
    .wishlist-item__stock {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-family: 'DM Sans', sans-serif;
      font-size: 11px;
      font-weight: 600;
      margin: 2px 0;

      &--ok       { color: var(--success); .stock-dot { background: var(--success); } }
      &--low      { color: var(--warning); .stock-dot { background: var(--warning); } }
      &--critical { color: var(--danger);  .stock-dot { background: var(--danger); } }
      &--out      { color: var(--text-soft); .stock-dot { background: var(--text-soft); } }
    }

    .stock-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .wishlist-item__added {
      font-family: 'DM Sans', sans-serif;
      font-size: 11px;
      color: var(--text-soft);
      margin: 2px 0 0;
    }

    // ── Actions ───────────────────────────────────────────────────────────────
    .wishlist-item__actions {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
      flex-shrink: 0;

      @media (max-width: $bp-sm) {
        grid-column: 1 / -1;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }
    }

    .wishlist-item__add-to-cart {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 34px;
      padding: 0 16px;
      border-radius: 24px;
      border: none;
      background-image: var(--bo-accent-gradient);
      color: var(--bo-color-on-accent);
      font-family: 'DM Sans', sans-serif;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: box-shadow 0.2s, transform 0.2s, opacity 0.2s;

      svg { width: 13px; height: 13px; }

      &:hover:not(:disabled) {
        box-shadow: var(--bo-shadow-card-hover);
        transform: translateY(-1px);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background-image: none;
        background: linear-gradient(135deg, var(--text-soft), var(--text-mid));
        color: #fff;
      }
    }

    .wishlist-item__remove {
      width: 32px;
      height: 32px;
      border: 1px solid transparent;
      background: transparent;
      color: var(--text-soft);
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s, color 0.15s, border-color 0.15s;

      svg { width: 14px; height: 14px; }

      &:hover:not(:disabled) {
        background: rgba(217, 64, 64, 0.08);
        color: var(--danger);
        border-color: rgba(217, 64, 64, 0.25);
      }

      &:disabled { opacity: 0.45; cursor: not-allowed; }
    }

    .remove-spinner {
      width: 13px;
      height: 13px;
      border: 2px solid rgba(217, 64, 64, 0.3);
      border-top-color: var(--danger);
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      display: inline-block;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class WishlistItemCardComponent {
  @Input({ required: true }) item!: WishlistItem;
  @Input() isRemoving = false;

  @Output() removeItem = new EventEmitter<number>();
  @Output() addToCart = new EventEmitter<number>();

  readonly imgError = signal(false);

  onImgError(): void {
    this.imgError.set(true);
  }

  onRemove(): void {
    this.removeItem.emit(this.item.productId);
  }

  readonly stockLabel = computed(() => {
    const qty = this.item.productStockQuantity;
    if (qty === 0)  return { level: 'out',      text: 'Out of stock' };
    if (qty <= 5)   return { level: 'critical', text: `Only ${qty} left` };
    if (qty <= 20)  return { level: 'low',      text: `Low stock (${qty})` };
    return              { level: 'ok',       text: 'In stock' };
  });
}