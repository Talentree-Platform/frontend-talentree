// ─────────────────────────────────────────────────────────────────────────────
// Talentree · Cart Loading Skeleton Component
// ─────────────────────────────────────────────────────────────────────────────
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart-loading-skeleton',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cart-skeleton">
      <!-- Header skeleton -->
      <div class="cart-skeleton__header">
        <div class="skel skel--sm"></div>
        <div class="skel skel--lg"></div>
        <div class="skel skel--md"></div>
      </div>

      <!-- Item skeletons -->
      @for (n of items; track $index) {
        <div class="cart-skeleton__item">
          <div class="skel skel--img"></div>
          <div class="cart-skeleton__info">
            <div class="skel skel--xs"></div>
            <div class="skel skel--name"></div>
            <div class="skel skel--price"></div>
          </div>
          <div class="cart-skeleton__stepper">
            <div class="skel skel--stepper"></div>
          </div>
          <div class="cart-skeleton__total">
            <div class="skel skel--total"></div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @mixin shimmer {
      background: linear-gradient(90deg, #f0ebe1 0%, #faf5ec 45%, #f0ebe1 80%);
      background-size: 1200px 100%;
      animation: shimmer 1.5s infinite linear;
      border-radius: 6px;
    }

    @keyframes shimmer {
      0%   { background-position: -600px 0; }
      100% { background-position: 600px 0; }
    }

    .cart-skeleton {
      background: #fff;
      border: 1px solid #E8D5A3;
      border-radius: 18px;
      overflow: hidden;
    }

    .cart-skeleton__header {
      padding: 20px 24px;
      background: #FBF3E2;
      border-bottom: 1px solid #E8D5A3;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .cart-skeleton__item {
      display: grid;
      grid-template-columns: 80px 1fr 160px 120px;
      gap: 16px;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #E8D5A3;

      &:last-child { border-bottom: none; }
    }

    .cart-skeleton__info {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .cart-skeleton__stepper {
      display: flex;
      justify-content: center;
    }

    .cart-skeleton__total {
      display: flex;
      justify-content: flex-end;
    }

    .skel {
      @include shimmer;

      &--xs      { height: 10px; width: 60px; }
      &--sm      { height: 10px; width: 80px; }
      &--md      { height: 14px; width: 55%; }
      &--lg      { height: 28px; width: 35%; }
      &--img     { width: 80px; height: 80px; border-radius: 12px; }
      &--name    { height: 16px; width: 75%; }
      &--price   { height: 12px; width: 40%; }
      &--stepper { height: 32px; width: 100px; border-radius: 30px; }
      &--total   { height: 20px; width: 90px; }
    }
  `],
})
export class CartLoadingSkeletonComponent {
  readonly items = Array.from({ length: 3 });
}