// ─────────────────────────────────────────────────────────────────────────────
// Talentree · Cart Error State Component
// ─────────────────────────────────────────────────────────────────────────────
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-cart-error-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: './cart-error-state.component.html',
  styles: ['./cart-error-state.component.scss'],
})
export class CartErrorStateComponent {
  @Input({ required: true }) message!: string;
  @Output() retry = new EventEmitter<void>();
}