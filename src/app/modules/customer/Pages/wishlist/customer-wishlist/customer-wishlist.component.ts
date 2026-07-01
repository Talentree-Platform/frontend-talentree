// ─────────────────────────────────────────────────────────────────────────────
// Talentree · Customer Wishlist Page
// ─────────────────────────────────────────────────────────────────────────────
import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CustomerWishlistService } from '../../../Core/services/wishlist.service';
import { CustomerCartService } from '../../../Core/services/cart-service.service';
import { WishlistItemCardComponent } from '../../../components/wishlist/wishlist-item-card/wishlist-item-card.component';
import { WishlistSummaryCardComponent } from '../../../components/wishlist/wishlist-summary-card/wishlist-summary-card.component';
import { WishlistLoadingSkeletonComponent } from '../../../components/wishlist/wishlist-loading-skelton/wishlist-loading-skelton.component';
import { WishlistErrorStateComponent } from '../../../components/wishlist/wishlist-error-state/wishlist-error-state.component';
import { EmptyWishlistStateComponent } from '../../../components/wishlist/empty-wishlist-state/empty-wishlist-state.component';

@Component({
  selector: 'app-customer-wishlist',
  standalone: true,
  imports: [
    RouterLink,
    WishlistItemCardComponent,
    WishlistSummaryCardComponent,
    WishlistLoadingSkeletonComponent,
    WishlistErrorStateComponent,
    EmptyWishlistStateComponent,
  ],
  templateUrl: './customer-wishlist.component.html',
  styleUrl: './customer-wishlist.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerWishlistComponent implements OnInit {
  protected readonly wishlistSvc = inject(CustomerWishlistService);
  private readonly cartSvc = inject(CustomerCartService);

  protected readonly clearConfirmVisible = signal(false);

  // ═══════════════════════════════════════════════════════════════════════════

  ngOnInit(): void {
    this.wishlistSvc.loadWishlist();
  }

  // ── Retry on error ────────────────────────────────────────────────────────
  onRetry(): void {
    this.wishlistSvc.loadWishlist();
  }

  // ── Remove item ───────────────────────────────────────────────────────────
  onRemoveItem(productId: number): void {
    this.wishlistSvc.removeItem(productId).subscribe({
      error: (err) => console.error('Remove from wishlist failed', err),
    });
  }

  // ── Add single item to cart ───────────────────────────────────────────────
  onAddToCart(productId: number): void {
    this.cartSvc.addItem(productId, 1).subscribe({
      next: () => {
        // Optionally remove from wishlist after adding to cart
        // this.wishlistSvc.removeItem(productId).subscribe();
      },
      error: (err) => console.error('Add to cart failed', err),
    });
  }

  // ── Move all to cart ──────────────────────────────────────────────────────
  onMoveAllToCart(): void {
    this.wishlistSvc.moveAllToCart().subscribe({
      error: (err) => console.error('Move all to cart failed', err),
    });
  }

  // ── Clear wishlist (with confirm step) ───────────────────────────────────
  onClearWishlist(): void {
    this.clearConfirmVisible.set(true);
  }

  confirmClearWishlist(): void {
    const items = this.wishlistSvc.wishlist()?.items ?? [];

    // Remove each item sequentially — no bulk-delete endpoint exists
    let completed = 0;
    for (const item of items) {
      this.wishlistSvc.removeItem(item.productId).subscribe({
        complete: () => {
          completed++;
          if (completed === items.length) {
            this.clearConfirmVisible.set(false);
          }
        },
        error: () => { completed++; },
      });
    }

    if (items.length === 0) {
      this.clearConfirmVisible.set(false);
    }
  }

  cancelClear(): void {
    this.clearConfirmVisible.set(false);
  }
}