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
      gap: 8px;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 18px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0,0,0,.12);
      animation: slideIn .25s ease;
      min-width: 260px;
      max-width: 380px;
    }
    @keyframes slideIn {
      from { transform: translateX(120%); opacity: 0; }
      to   { transform: translateX(0);   opacity: 1; }
    }
    .toast--success { background: #137333; color: #fff; }
    .toast--error   { background: #d93025; color: #fff; }
    .toast--info    { background: #1a73e8; color: #fff; }
    .toast-icon { font-size: 16px; }
  `],
})
export class ToastContainerComponent {
  toastSvc = inject(ToastService);
  icons = { success: '✓', error: '✕', info: 'ℹ' };
}