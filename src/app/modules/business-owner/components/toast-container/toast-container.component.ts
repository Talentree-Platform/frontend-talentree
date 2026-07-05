import { Component, inject } from '@angular/core';
import { ToastService } from '../../core/services/toast.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="toast-container">
      @for (toast of toastSvc.toasts(); track toast.id) {
        <div class="toast toast--{{ toast.type }}" (click)="toastSvc.dismiss(toast.id)">
          <span class="toast-icon">{{ icons[toast.type] }}</span>
          <span>{{ toast.message }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: var(--bo-radius-card, 14px);
      font-size: 14px;
      font-weight: 500;
      font-family: inherit;
      cursor: pointer;
      background: var(--bo-bg-surface-hover, #fff);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: var(--bo-border-surface, 1px solid rgba(0,0,0,0.1));
      border-left-width: 3px;
      color: var(--bo-color-text, #111827);
      box-shadow: var(--bo-shadow-card, 0 4px 20px rgba(0,0,0,.12));
      animation: slideIn .25s ease;
      min-width: 260px;
      max-width: 380px;
    }
    @keyframes slideIn {
      from { transform: translateX(120%); opacity: 0; }
      to   { transform: translateX(0);   opacity: 1; }
    }
    .toast-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      flex-shrink: 0;
      font-size: 13px;
      line-height: 1;
    }
    .toast--success { border-left-color: #10b981; }
    .toast--success .toast-icon { background: rgba(16,185,129,0.15); color: #10b981; }
    .toast--error { border-left-color: #ef4444; }
    .toast--error .toast-icon { background: rgba(239,68,68,0.15); color: #ef4444; }
    .toast--info { border-left-color: var(--bo-accent, #d1a33e); }
    .toast--info .toast-icon { background: var(--bo-accent-soft, rgba(209,163,62,0.12)); color: var(--bo-accent, #d1a33e); }
  `],
})
export class ToastContainerComponent {
  toastSvc = inject(ToastService);
  icons = { success: '✓', error: '✕', info: 'ℹ' };
}