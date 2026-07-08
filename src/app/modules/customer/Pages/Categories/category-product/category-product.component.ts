// ─────────────────────────────────────────────────────────────────────────────
// Talentree – Category Products Page
// Route: /customer/categoryProduct/:id
// ─────────────────────────────────────────────────────────────────────────────

import {
  Component, OnInit, OnDestroy, inject,
  ChangeDetectionStrategy, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CustomerMarketplaceService } from '../../../Core/services/customer-marketplace.service';
import { CustomerProductCardComponent } from '../../../components/customer-product-card/customer-product-card.component';
import { CustomerCartService } from '../../../Core/services/cart-service.service';
import { ToastService } from '../../../Core/services/toast.service';
import { Category } from '../../../Core/interfaces/customer';

@Component({
  selector: 'app-category-products',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CustomerProductCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './category-product.component.html',
  styleUrls: ['./category-product.component.scss'],
})
export class CategoryProductsComponent implements OnInit, OnDestroy {

  protected readonly svc    = inject(CustomerMarketplaceService);
  private readonly route    = inject(ActivatedRoute);
  private readonly cartSvc  = inject(CustomerCartService);
  private readonly toastSvc = inject(ToastService);

  readonly skeletonArray = Array.from({ length: 8 });

  // ── Filter / Search local state ───────────────────────────────────────────
  readonly searchTerm  = signal('');
  readonly minPrice    = signal<number | null>(null);
  readonly maxPrice    = signal<number | null>(null);
  readonly sortBy      = signal('newest');
  readonly currentPage = signal(1);
  readonly pageSize    = 12;

  // Route param
  private categoryId = '';

  // ── Derived ───────────────────────────────────────────────────────────────

  /** Find category name from the already-loaded categories list (no extra HTTP call). */
  readonly currentCategory = computed<Category | undefined>(() =>
    this.svc.categoriesData().find(c => c.id === this.categoryId)
  );

  readonly totalPages = computed(() =>
    this.svc.categoryProductsData()?.totalPages ?? 1
  );

  readonly totalCount = computed(() =>
    this.svc.categoryProductsData()?.count ?? 0
  );

  readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: (number | '...')[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i);
      }
      if (current < total - 2) pages.push('...');
      pages.push(total);
    }
    return pages;
  });

  readonly sortOptions = [
    { value: 'newest',     label: 'Newest First' },
    { value: 'price_asc',  label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating',     label: 'Highest Rated' },
    { value: 'popularity', label: 'Most Popular' },
  ];

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.categoryId = this.route.snapshot.paramMap.get('id') ?? '';

    // Ensure categories are loaded so we can show the category name
    if (this.svc.categoriesData().length === 0) {
      this.svc.loadCategories();
    }

    this.loadPage(1);
  }

  ngOnDestroy(): void {
    this.svc.resetCategoryProducts();
  }

  // ── Data loading ──────────────────────────────────────────────────────────

  private buildParams() {
    return {
      Search:    this.searchTerm() || undefined,
      MinPrice:  this.minPrice() ?? undefined,
      MaxPrice:  this.maxPrice() ?? undefined,
      SortBy:    this.sortBy() || undefined,
      PageIndex: this.currentPage(),
      PageSize:  this.pageSize,
    };
  }

  loadPage(page: number): void {
    this.currentPage.set(page);
    this.svc.loadCategoryProducts(this.categoryId, this.buildParams());
  }

  // ── Filter actions ────────────────────────────────────────────────────────

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.loadPage(1);
  }

  onSortChange(value: string): void {
    this.sortBy.set(value);
    this.loadPage(1);
  }

  applyPriceFilter(): void {
    this.loadPage(1);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.sortBy.set('newest');
    this.loadPage(1);
  }

  hasActiveFilters(): boolean {
    return !!(
      this.searchTerm() ||
      this.minPrice() != null ||
      this.maxPrice() != null ||
      this.sortBy() !== 'newest'
    );
  }

  retry(): void {
    this.loadPage(this.currentPage());
  }

  // ── Cart ──────────────────────────────────────────────────────────────────

  onAddedToCart(e: {
    productId: string;
    qty: number;
    productName?: string;
    imageUrl?: string | null;
  }): void {
    this.cartSvc.addItem(Number(e.productId), e.qty).subscribe({
      next: () => {
        this.toastSvc.success(
          'Added to cart',
          e.productName ?? 'Item added successfully',
          e.imageUrl ?? null
        );
      },
      error: () => {
        this.toastSvc.error(
          'Could not add item',
          this.cartSvc.addError() ?? 'Please try again.'
        );
      },
    });
  }

  // ── Pagination ─────────────────────────────────────────────────────────────

  isNumber(p: number | '...'): p is number { return typeof p === 'number'; }

  trackByPage(_: number, p: number | '...'): string | number { return p; }
}