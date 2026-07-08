// ─────────────────────────────────────────────────────────────────────────────
// Talentree · Empty Cart State Component
// ─────────────────────────────────────────────────────────────────────────────
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-empty-cart-state',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty-cart">
      <div class="empty-cart__illustration">
        <!-- Elegant empty cart SVG -->
        <svg viewBox="0 0 180 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Cart body -->
          <path d="M30 40h10l16 72h84l14-56H58" stroke="#E8D5A3" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          <!-- Cart handle -->
          <path d="M20 30h8l4 10" stroke="#C9952A" stroke-width="2.5" stroke-linecap="round"/>
          <!-- Wheels -->
          <circle cx="76" cy="124" r="8" stroke="#B8860B" stroke-width="2.5"/>
          <circle cx="140" cy="124" r="8" stroke="#B8860B" stroke-width="2.5"/>
          <!-- Gold accent lines inside cart (empty state detail) -->
          <path d="M75 95h50" stroke="#E8D5A3" stroke-width="1.5" stroke-dasharray="4 3"/>
          <path d="M70 80h60" stroke="#E8D5A3" stroke-width="1.5" stroke-dasharray="4 3"/>
          <!-- Sparkle dots -->
          <circle cx="152" cy="38" r="3" fill="#C9952A" opacity="0.6"/>
          <circle cx="162" cy="56" r="2" fill="#B8860B" opacity="0.4"/>
          <circle cx="145" cy="52" r="1.5" fill="#C9952A" opacity="0.5"/>
          <!-- Plus sign suggesting adding items -->
          <circle cx="112" cy="60" r="16" stroke="#E8D5A3" stroke-width="1.5" stroke-dasharray="3 2"/>
          <path d="M112 53v14M105 60h14" stroke="#C9952A" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>

      <h2 class="empty-cart__title">Your cart is empty</h2>
      <p class="empty-cart__desc">
        You haven't added any products yet. Explore our curated catalogue of raw materials from verified suppliers.
      </p>

      <div class="empty-cart__actions">
        <a routerLink="/customer/customerProduct" class="empty-cart__btn-primary">
          Browse Products
          <svg viewBox="0 0 16 16" fill="none"><path d="M3 8h10M8 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
        <a routerLink="/customer/customerhome" class="empty-cart__btn-ghost">
          Back to Marketplace
        </a>
      </div>

      <!-- Suggestion tags -->
      <div class="empty-cart__tags">
        <span class="empty-tag-label">Popular searches:</span>
        @for (tag of ['Aluminium', 'Cotton Yarn', 'PVC Resin', 'Epoxy']; track tag) {
          <a [routerLink]="['/customer/customerProduct']" [queryParams]="{search: tag}" class="empty-tag">
            {{ tag }}
          </a>
        }
      </div>
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

    .empty-cart {
      background: #fff;
      border: 1px solid $gold-border;
      border-radius: 18px;
      padding: 60px 40px;
      text-align: center;
      box-shadow: 0 2px 20px rgba($gold, 0.06);
    }

    .empty-cart__illustration {
      margin: 0 auto 28px;
      width: 180px;
      height: 160px;

      svg {
        width: 100%;
        height: 100%;
        filter: drop-shadow(0 4px 12px rgba($gold, 0.15));
      }
    }

    .empty-cart__title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 28px;
      font-weight: 600;
      color: $text-dark;
      margin: 0 0 12px;
    }

    .empty-cart__desc {
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      color: $text-soft;
      line-height: 1.7;
      max-width: 360px;
      margin: 0 auto 28px;
    }

    .empty-cart__actions {
      display: flex;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 28px;
    }

    .empty-cart__btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      height: 44px;
      padding: 0 26px;
      border-radius: 40px;
      background: linear-gradient(135deg, $gold, $gold-light);
      color: #fff;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      transition: box-shadow 0.25s, transform 0.25s;

      svg { width: 14px; height: 14px; }

      &:hover {
        box-shadow: 0 6px 20px rgba($gold, 0.4);
        transform: translateY(-1px);
      }
    }

    .empty-cart__btn-ghost {
      display: inline-flex;
      align-items: center;
      height: 44px;
      padding: 0 22px;
      border-radius: 40px;
      border: 1.5px solid $gold-border;
      color: $text-mid;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 500;
      text-decoration: none;
      transition: border-color 0.2s, background 0.2s;

      &:hover {
        border-color: $gold;
        background: $gold-pale;
      }
    }

    .empty-cart__tags {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .empty-tag-label {
      font-family: 'DM Sans', sans-serif;
      font-size: 11px;
      color: $text-soft;
    }

    .empty-tag {
      font-family: 'DM Sans', sans-serif;
      font-size: 12px;
      color: $text-mid;
      background: $gold-pale;
      border: 1px solid $gold-border;
      border-radius: 20px;
      padding: 3px 12px;
      text-decoration: none;
      transition: background 0.2s, color 0.2s;

      &:hover {
        background: rgba($gold, 0.12);
        color: $gold;
        border-color: rgba($gold, 0.35);
      }
    }
  `],
})
export class EmptyCartStateComponent {}