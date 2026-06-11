import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports:[CommonModule , ReactiveFormsModule],
  template: `
    <span class="badge" [ngClass]="badgeClass">{{ label }}</span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .04em;
      text-transform: uppercase;
    }
    .badge-open     { background: #e8f4fd; color: #1a73e8; }
    .badge-pending  { background: #fff3e0; color: #f57c00; }
    .badge-closed   { background: #f1f3f4; color: #5f6368; }
    .badge-high     { background: #fce8e6; color: #d93025; }
    .badge-medium   { background: #fff3e0; color: #f29900; }
    .badge-low      { background: #e6f4ea; color: #137333; }
    .badge-default  { background: #f1f3f4; color: #5f6368; }
  `],
})
export class StatusBadgeComponent {
  @Input() label = '';
  @Input() variant: 'status' | 'priority' = 'status';
  @Input() value = 0;

  get badgeClass(): string {
    if (this.variant === 'priority') {
      const map: Record<number, string> = { 1: 'badge-high', 2: 'badge-medium', 3: 'badge-low' };
      return map[this.value] ?? 'badge-default';
    }
    // status: 1=open,2=pending,3=closed
    const map: Record<number, string> = { 1: 'badge-open', 2: 'badge-pending', 3: 'badge-closed' };
    return map[this.value] ?? 'badge-default';
  }
}