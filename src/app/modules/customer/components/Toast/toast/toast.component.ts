// ─────────────────────────────────────────────────────────────────────────────
// Talentree · Toast — Component
// ─────────────────────────────────────────────────────────────────────────────
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../Core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: './toast.component.html',
  styles: ['./toast.component.scss'],
})
export class ToastComponent {
  protected readonly toastSvc = inject(ToastService);
}