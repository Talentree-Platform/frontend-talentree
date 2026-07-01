// ─────────────────────────────────────────────────────────────────────────────
// Talentree · Wishlist Loading Skeleton Component
// ─────────────────────────────────────────────────────────────────────────────
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-wishlist-loading-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wishlist-skeleton">
      @for (i of [1, 2, 3]; track i) {
        <div class="skeleton-item">
          <div class="skeleton-img shimmer"></div>
          <div class="skeleton-info">
            <div class="skeleton-brand shimmer"></div>
            <div class="skeleton-name shimmer"></div>
            <div class="skeleton-price shimmer"></div>
            <div class="skeleton-stock shimmer"></div>
          </div>
          <div class="skeleton-actions">
            <div class="skeleton-btn shimmer"></div>
            <div class="skeleton-icon shimmer"></div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    $gold:        #B8860B;
    $gold-border: #E8D5A3;
    $gold-pale:   #FBF3E2;

    .wishlist-skeleton {
      background: #fff;
      border: 1px solid $gold-border;
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 2px 20px rgba($gold, 0.07);
    }

    .skeleton-item {
      display: grid;
      grid-template-columns: 90px 1fr auto;
      gap: 20px;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid $gold-border;

      &:last-child { border-bottom: none; }
    }

    .skeleton-img {
      width: 90px;
      height: 90px;
      border-radius: 12px;
    }

    .skeleton-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .skeleton-brand  { height: 10px; width: 80px;  border-radius: 6px; }
    .skeleton-name   { height: 16px; width: 200px; border-radius: 6px; }
    .skeleton-price  { height: 14px; width: 100px; border-radius: 6px; }
    .skeleton-stock  { height: 10px; width: 70px;  border-radius: 6px; }

    .skeleton-actions {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
    }

    .skeleton-btn  { height: 34px; width: 110px; border-radius: 24px; }
    .skeleton-icon { height: 32px; width: 32px;  border-radius: 8px; }

    .shimmer {
      background: linear-gradient(90deg, $gold-pale 25%, #fff 50%, $gold-pale 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
    }

    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `],
})
export class WishlistLoadingSkeletonComponent {}