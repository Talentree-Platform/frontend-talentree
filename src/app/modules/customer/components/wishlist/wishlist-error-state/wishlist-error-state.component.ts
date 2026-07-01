// ─────────────────────────────────────────────────────────────────────────────
// Talentree · Wishlist Error State Component
// ─────────────────────────────────────────────────────────────────────────────
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-wishlist-error-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wishlist-error">
      <div class="wishlist-error__icon">
        <svg viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="22" stroke="#E8D5A3" stroke-width="2"/>
          <path d="M24 14v14" stroke="#C9952A" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="24" cy="34" r="1.5" fill="#C9952A"/>
        </svg>
      </div>
      <h3 class="wishlist-error__title">Couldn't load wishlist</h3>
      <p class="wishlist-error__message">{{ message }}</p>
      <button class="wishlist-error__retry" (click)="retry.emit()">
        <svg viewBox="0 0 16 16" fill="none">
          <path d="M2 8a6 6 0 1 1 1.5 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M2 12V8h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Try again
      </button>
    </div>
  `,
  styles: [`
    $gold:        #B8860B;
    $gold-light:  #C9952A;
    $gold-pale:   #FBF3E2;
    $gold-border: #E8D5A3;
    $text-dark:   #18130A;
    $text-soft:   #A09280;

    .wishlist-error {
      background: #fff;
      border: 1px solid $gold-border;
      border-radius: 18px;
      padding: 52px 40px;
      text-align: center;
      box-shadow: 0 2px 20px rgba($gold, 0.06);
    }

    .wishlist-error__icon {
      margin: 0 auto 20px;
      width: 48px;
      height: 48px;
    }

    .wishlist-error__title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 22px;
      font-weight: 600;
      color: $text-dark;
      margin: 0 0 8px;
    }

    .wishlist-error__message {
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      color: $text-soft;
      margin: 0 0 24px;
      line-height: 1.6;
    }

    .wishlist-error__retry {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      height: 38px;
      padding: 0 22px;
      border-radius: 30px;
      border: 1.5px solid $gold-border;
      background: transparent;
      color: $gold-light;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s, border-color 0.2s;

      svg { width: 14px; height: 14px; }

      &:hover {
        background: $gold-pale;
        border-color: $gold;
      }
    }
  `],
})
export class WishlistErrorStateComponent {
  @Input({ required: true }) message!: string;
  @Output() retry = new EventEmitter<void>();
}