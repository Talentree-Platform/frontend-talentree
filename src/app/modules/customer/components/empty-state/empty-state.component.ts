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
    :host {
      display: block;
    }
    .empty {
      display: flex; flex-direction: column; align-items: center;
      text-align: center; padding: 72px 24px; gap: 16px;
    }
    .empty-icon {
      width: 80px; height: 80px;
      background: var(--bo-accent-soft);
      border: 1.5px solid var(--bo-border-surface-hover);
      border-radius: 20px;
      display: flex; align-items: center; justify-content: center;
      font-size: 32px; margin-bottom: 8px;
    }
    .empty-title {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 26px; font-weight: 600; color: var(--bo-color-text); margin: 0;
    }
    .empty-text {
      font-family: 'DM Sans', sans-serif;
      font-size: 15px; color: var(--bo-color-text-muted);
      max-width: 360px; line-height: 1.65; margin: 0;
    }
    .empty-btn {
      margin-top: 8px; padding: 11px 28px;
      background-image: var(--bo-accent-gradient);
      color: var(--bo-color-on-accent); border: none; border-radius: 10px;
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
