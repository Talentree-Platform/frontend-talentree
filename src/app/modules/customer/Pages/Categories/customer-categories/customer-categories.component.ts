// ─────────────────────────────────────────────────────────────────────────────
// Talentree – Customer Categories Page
// Route: /marketplace/categories
// ─────────────────────────────────────────────────────────────────────────────

import {
  Component, OnInit, inject, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CustomerMarketplaceService } from '../../../Core/services/customer-marketplace.service';

@Component({
  selector: 'app-customer-categories',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './customer-categories.component.html',
  styleUrls: ['./customer-categories.component.scss'],
})
export class CustomerCategoriesComponent implements OnInit {
  protected readonly svc    = inject(CustomerMarketplaceService);
  private readonly router   = inject(Router);

  readonly skeletonArray = Array.from({ length: 8 });

  ngOnInit(): void {
    // Load only if not already populated (e.g. came from home page)
    if (this.svc.categoriesData().length === 0) {
      this.svc.loadCategories();
    }
  }

  navigateToCategory(id: string): void {
    this.router.navigate(['/marketplace/categories', id]);
  }

  retry(): void {
    this.svc.loadCategories();
  }
}