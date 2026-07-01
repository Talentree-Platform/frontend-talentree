import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

export interface BreadcrumbItem {
  label: string;
  route?: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="breadcrumb" aria-label="Breadcrumb">
      @for (item of items; track item.label; let last = $last) {
        @if (item.route && !last) {
          <a class="bc-link" [routerLink]="item.route">{{ item.label }}</a>
          <span class="bc-sep" aria-hidden="true">›</span>
        } @else {
          <span class="bc-current" [attr.aria-current]="last ? 'page' : null">{{ item.label }}</span>
        }
      }
    </nav>
  `,
  styles: [`
    .breadcrumb {
      display: flex; align-items: center; gap: 6px;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
    }
    .bc-link {
      color: var(--text-soft, #A09280); text-decoration: none;
      transition: color 180ms ease;
      &:hover { color: var(--gold, #B8860B); }
    }
    .bc-sep { color: var(--border, #EDE8DF); }
    .bc-current { color: var(--text-dark, #18130A); font-weight: 500; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbComponent {
  @Input({ required: true }) items!: BreadcrumbItem[];
}
