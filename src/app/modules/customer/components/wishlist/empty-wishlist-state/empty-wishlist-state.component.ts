// ─────────────────────────────────────────────────────────────────────────────
// Talentree · Empty Wishlist State Component
// ─────────────────────────────────────────────────────────────────────────────
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-empty-wishlist-state',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty-wishlist">
      <div class="empty-wishlist__illustration">
        <svg viewBox="0 0 180 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Heart outline -->
          <path d="M90 128s-52-34-52-66c0-18 14-32 32-32 10 0 18 5 20 8 2-3 10-8 20-8 18 0 32 14 32 32 0 32-52 66-52 66z"
            stroke="#E8D5A3" stroke-width="2.5" stroke-linejoin="round"/>
          <!-- Inner heart glow -->
          <path d="M90 118s-38-25-38-50c0-12 9-20 20-20 7 0 13 4 18 10 5-6 11-10 18-10 11 0 20 8 20 20 0 25-38 50-38 50z"
            fill="none" stroke="#C9952A" stroke-width="1.5" opacity="0.5"/>
          <!-- Sparkle dots -->
          <circle cx="148" cy="38" r="3" fill="#C9952A" opacity="0.6"/>
          <circle cx="158" cy="56" r="2" fill="#B8860B" opacity="0.4"/>
          <circle cx="142" cy="52" r="1.5" fill="#C9952A" opacity="0.5"/>
          <circle cx="32" cy="44" r="2.5" fill="#C9952A" opacity="0.4"/>
          <circle cx="22" cy="60" r="1.5" fill="#B8860B" opacity="0.35"/>
          <!-- Dashed ring suggesting action -->
          <circle cx="90" cy="70" r="55" stroke="#E8D5A3" stroke-width="1" stroke-dasharray="4 4" opacity="0.5"/>
          <!-- Plus sign -->
          <circle cx="90" cy="70" r="18" stroke="#E8D5A3" stroke-width="1.5" stroke-dasharray="3 2"/>
          <path d="M90 62v16M82 70h16" stroke="#C9952A" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>

      <h2 class="empty-wishlist__title">Your wishlist is empty</h2>
      <p class="empty-wishlist__desc">
        Save products you love and come back to them anytime. Browse our curated catalogue and tap the heart icon to get started.
      </p>

      <div class="empty-wishlist__actions">
        <a routerLink="/customer/customerProduct" class="empty-wishlist__btn-primary">
          Explore Products
          <svg viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M8 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
        <a routerLink="/customer/customerhome" class="empty-wishlist__btn-ghost">
          Back to Marketplace
        </a>
      </div>

      <div class="empty-wishlist__tags">
        <span class="empty-tag-label">Popular right now:</span>
        @for (tag of ['Shea Butter', 'Essential Oils', 'Cotton Yarn', 'Epoxy Resin']; track tag) {
          <a [routerLink]="['/customer/customerProduct']" [queryParams]="{search: tag}" class="empty-tag">
            {{ tag }}
          </a>
        }
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
    }

    .empty-wishlist {
      background: var(--bo-bg-surface);
      border: var(--bo-border-surface);
      border-radius: 18px;
      padding: 60px 40px;
      text-align: center;
      box-shadow: var(--bo-shadow-card);
    }

    .empty-wishlist__illustration {
      margin: 0 auto 28px;
      width: 180px;
      height: 160px;

      svg {
        width: 100%;
        height: 100%;
        filter: drop-shadow(0 4px 12px rgba(184, 134, 11, 0.15));
      }
    }

    .empty-wishlist__title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 28px;
      font-weight: 600;
      color: var(--text-dark);
      margin: 0 0 12px;
    }

    .empty-wishlist__desc {
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      color: var(--text-soft);
      line-height: 1.7;
      max-width: 360px;
      margin: 0 auto 28px;
    }

    .empty-wishlist__actions {
      display: flex;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 28px;
    }

    .empty-wishlist__btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      height: 44px;
      padding: 0 26px;
      border-radius: 40px;
      background-image: var(--bo-accent-gradient);
      color: var(--bo-color-on-accent);
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      transition: box-shadow 0.25s, transform 0.25s;

      svg { width: 14px; height: 14px; }

      &:hover {
        box-shadow: var(--bo-shadow-card-hover);
        transform: translateY(-1px);
      }
    }

    .empty-wishlist__btn-ghost {
      display: inline-flex;
      align-items: center;
      height: 44px;
      padding: 0 22px;
      border-radius: 40px;
      border: var(--bo-border-surface);
      color: var(--text-mid);
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 500;
      text-decoration: none;
      transition: border-color 0.2s, background 0.2s;

      &:hover {
        border-color: var(--bo-border-surface-hover);
        background: var(--gold-soft);
      }
    }

    .empty-wishlist__tags {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .empty-tag-label {
      font-family: 'DM Sans', sans-serif;
      font-size: 11px;
      color: var(--text-soft);
    }

    .empty-tag {
      font-family: 'DM Sans', sans-serif;
      font-size: 12px;
      color: var(--text-mid);
      background: var(--bo-bg-surface-hover);
      border: var(--bo-border-surface);
      border-radius: 20px;
      padding: 3px 12px;
      text-decoration: none;
      transition: background 0.2s, color 0.2s;

      &:hover {
        background: var(--gold-soft);
        color: var(--gold);
        border-color: var(--bo-border-surface-hover);
      }
    }
  `],
})
export class EmptyWishlistStateComponent {}