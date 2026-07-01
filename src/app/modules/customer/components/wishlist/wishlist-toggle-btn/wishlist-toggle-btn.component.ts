// ─────────────────────────────────────────────────────────────────────────────
// Talentree · Wishlist Toggle Button
// Reusable heart icon button for product cards / product detail pages.
// Handles its own status check on init; toggles on click.
// ─────────────────────────────────────────────────────────────────────────────
import {
  Component,
  Input,
  OnInit,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CustomerWishlistService } from '../../../Core/services/wishlist.service';


@Component({
  selector: 'app-wishlist-toggle-btn',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      class="wishlist-toggle"
      [class.wishlist-toggle--active]="isActive()"
      [class.wishlist-toggle--loading]="isLoading()"
      [attr.aria-label]="ariaLabel()"
      [disabled]="isLoading()"
      (click)="onToggle($event)"
      [title]="ariaLabel()"
    >
      @if (isLoading()) {
        <span class="wishlist-toggle__spinner"></span>
      } @else {
        <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          @if (isActive()) {
            <!-- Filled heart when in wishlist -->
            <path d="M9 15s-6-4-6-8a4 4 0 0 1 6-3.46A4 4 0 0 1 15 7c0 4-6 8-6 8z"
              fill="currentColor" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
          } @else {
            <!-- Outline heart when not in wishlist -->
            <path d="M9 15s-6-4-6-8a4 4 0 0 1 6-3.46A4 4 0 0 1 15 7c0 4-6 8-6 8z"
              stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
          }
        </svg>
      }
    </button>
  `,
  styles: [`
    $gold:        #B8860B;
    $gold-light:  #C9952A;
    $gold-pale:   #FBF3E2;
    $gold-border: #E8D5A3;
    $text-soft:   #A09280;
    $danger:      #D94040;

    .wishlist-toggle {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 1.5px solid $gold-border;
      background: rgba(255, 255, 255, 0.9);
      color: $text-soft;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: border-color 0.2s, color 0.2s, background 0.2s, transform 0.15s;
      flex-shrink: 0;

      svg { width: 16px; height: 16px; transition: transform 0.2s; }

      &:hover:not(:disabled) {
        border-color: rgba($danger, 0.45);
        color: $danger;
        background: rgba($danger, 0.06);
        transform: scale(1.08);

        svg { transform: scale(1.1); }
      }

      &--active {
        border-color: rgba($danger, 0.4);
        color: $danger;
        background: rgba($danger, 0.06);

        &:hover:not(:disabled) {
          background: rgba($danger, 0.1);
        }
      }

      &--loading,
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }
    }

    .wishlist-toggle__spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba($danger, 0.25);
      border-top-color: $danger;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      display: inline-block;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class WishlistToggleBtnComponent implements OnInit {
  @Input({ required: true }) productId!: number;

  private readonly wishlistSvc = inject(CustomerWishlistService);

  /** Whether we are waiting for the server response */
  readonly isLoading = computed(
    () =>
      this.wishlistSvc.addingProductId() === this.productId ||
      this.wishlistSvc.removingProductId() === this.productId
  );

  /** Whether the product is currently in the wishlist */
  readonly isActive = signal(false);

  readonly ariaLabel = computed(() =>
    this.isActive() ? 'Remove from wishlist' : 'Add to wishlist'
  );

  ngOnInit(): void {
    // Sync with already-loaded wishlist first (instant, no network call)
    this.isActive.set(this.wishlistSvc.isInWishlist(this.productId));

    // Then verify with the server (keeps status fresh)
    this.wishlistSvc.checkStatus(this.productId).subscribe({
      next: (inWishlist) => this.isActive.set(inWishlist),
    });
  }

  onToggle(event: Event): void {
    event.stopPropagation(); // Prevent bubbling to parent product card click handlers

    this.wishlistSvc.toggle(this.productId).subscribe({
      next: (wishlist) => {
        this.isActive.set(wishlist.items.some((i) => i.productId === this.productId));
      },
      error: (err) => console.error('Wishlist toggle failed', err),
    });
  }
}