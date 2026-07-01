import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty">
      <div class="empty-icon" [innerHTML]="icon"></div>
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-text">{{ message }}</p>
      @if (actionLabel) {
        <button class="empty-btn" (click)="action.emit()">{{ actionLabel }}</button>
      }
    </div>
  `,
  styles: [`
    .empty {
      display: flex; flex-direction: column; align-items: center;
      text-align: center; padding: 72px 24px; gap: 16px;
    }
    .empty-icon {
      width: 80px; height: 80px;
      background: var(--gold-pale, #FBF3E2);
      border: 1.5px solid var(--gold-border, #E8D5A3);
      border-radius: 20px;
      display: flex; align-items: center; justify-content: center;
      font-size: 32px; margin-bottom: 8px;
    }
    .empty-title {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 26px; font-weight: 600; color: var(--text-dark, #18130A); margin: 0;
    }
    .empty-text {
      font-family: 'DM Sans', sans-serif;
      font-size: 15px; color: var(--text-soft, #A09280);
      max-width: 360px; line-height: 1.65; margin: 0;
    }
    .empty-btn {
      margin-top: 8px; padding: 11px 28px;
      background: linear-gradient(135deg, var(--gold, #B8860B), var(--gold-light, #C9952A));
      color: #fff; border: none; border-radius: 10px;
      font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
      cursor: pointer; transition: opacity 200ms ease, transform 180ms ease;
      box-shadow: 0 4px 16px rgba(184,134,11,.28);
      &:hover { opacity: .9; transform: translateY(-2px); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  @Input() icon = '🔍';
  @Input() title = 'Nothing found';
  @Input() message = 'Try adjusting your search or filters.';
  @Input() actionLabel = '';
  @Output() action = new EventEmitter<void>();
}
