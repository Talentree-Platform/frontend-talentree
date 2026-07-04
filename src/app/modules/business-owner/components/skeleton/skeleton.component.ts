import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: `
    <div class="skeleton" [style.width]="width" [style.height]="height" [style.border-radius]="radius"></div>
  `,
  styles: [`
    .skeleton {
      background: linear-gradient(90deg, var(--bo-bg-surface, #f0f0f0) 25%, var(--bo-bg-surface-hover, #e0e0e0) 50%, var(--bo-bg-surface, #f0f0f0) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
    }
    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `],
})
export class SkeletonComponent {
  @Input() width  = '100%';
  @Input() height = '16px';
  @Input() radius = '6px';
}