// ─────────────────────────────────────────────────────────────────────────────
// Talentree · Toast — Service
// ─────────────────────────────────────────────────────────────────────────────
import { Injectable, signal, computed } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  imageUrl?: string | null;
  duration?: number; // ms, default 3500
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);

  readonly toasts = this._toasts.asReadonly();
  readonly hasToasts = computed(() => this._toasts().length > 0);

  show(toast: Omit<Toast, 'id'>): void {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const duration = toast.duration ?? 3500;

    this._toasts.update((list) => [...list, { ...toast, id }]);

    setTimeout(() => this.dismiss(id), duration);
  }

  success(title: string, message?: string, imageUrl?: string | null): void {
    this.show({ type: 'success', title, message, imageUrl });
  }

  error(title: string, message?: string): void {
    this.show({ type: 'error', title, message });
  }

  info(title: string, message?: string): void {
    this.show({ type: 'info', title, message });
  }

  warning(title: string, message?: string): void {
    this.show({ type: 'warning', title, message });
  }

  dismiss(id: string): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }

  dismissAll(): void {
    this._toasts.set([]);
  }
}