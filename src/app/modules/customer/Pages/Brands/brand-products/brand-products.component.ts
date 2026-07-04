// ─────────────────────────────────────────────────────────────────────────────
// Talentree – Brand Products Page  (NEW)
// Route: /customer/brandProduct/:id
// Mirrors the Category Products component contract 1:1 — same signals,
// same filter/sort/pagination methods — only the data source is brand-scoped.
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

const DEBOUNCE_MS = 350;

@Component({
  selector: 'app-brand-products',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    CustomerProductCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './brand-products.component.html',
  styleUrls: ['./brand-products.component.scss'],
})
export class BrandProductsComponent implements OnInit, OnDestroy {
  protected readonly svc    = inject(CustomerMarketplaceService);
  private readonly route    = inject(ActivatedRoute);
  private readonly cartSvc  = inject(CustomerCartService);
  private readonly toastSvc = inject(ToastService);

  readonly skeletonArray = Array.from({ length: 6 });

  readonly sortOptions = [
    { value: 'newest',     label: 'Newest' },
    { value: 'price_asc',  label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating',     label: 'Top Rated' },
  ];

  // ── Local filter state (mirrors category-products component) ───────────────
  readonly searchTerm = signal('');
  readonly minPrice    = signal<number | null>(null);
  readonly maxPrice    = signal<number | null>(null);
  readonly sortBy      = signal('newest');
  readonly currentPage = signal(1);

  private brandId!: string;
  private searchDebounceHandle: ReturnType<typeof setTimeout> | null = null;

  // ── Derived data ──────────────────────────────────────────────────────────

  /** Brand profile fields (name, description, logo, social links) for the header. */
  readonly currentBrand = computed(() => this.svc.brandDetails());

  readonly totalCount = computed(() => this.svc.brandProductsData()?.count ?? 0);
  readonly totalPages = computed(() => this.svc.brandProductsData()?.totalPages ?? 1);

  readonly hasActiveFilters = computed(() =>
    !!this.searchTerm() ||
    this.minPrice() !== null ||
    this.maxPrice() !== null ||
    this.sortBy() !== 'newest'
  );

  hasSocialLinks(): boolean {
    const b = this.currentBrand();
    return !!(b?.facebookLink || b?.instagramLink || b?.websiteLink);
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.brandId = this.route.snapshot.paramMap.get('id') ?? '';

    // Brand profile (name/desc/logo/social/address) — used in the page header.
    this.svc.loadBrandDetails(this.brandId);

    // Paginated, filterable product list for this brand.
    this.fetchProducts();
  }

  ngOnDestroy(): void {
    this.svc.resetBrandProducts();
    this.svc.resetBrandDetailsState();
    if (this.searchDebounceHandle) clearTimeout(this.searchDebounceHandle);
  }

  // ── Data fetching ─────────────────────────────────────────────────────────

  private fetchProducts(): void {
    this.svc.loadBrandProducts(this.brandId, {
      Search:    this.searchTerm()  || undefined,
      MinPrice:  this.minPrice()    ?? undefined,
      MaxPrice:  this.maxPrice()    ?? undefined,
      SortBy:    this.sortBy(),
      PageIndex: this.currentPage(),
      PageSize:  12,
    });
  }

  retry(): void {
    this.fetchProducts();
  }

  // ── Filter handlers ───────────────────────────────────────────────────────

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    if (this.searchDebounceHandle) clearTimeout(this.searchDebounceHandle);
    this.searchDebounceHandle = setTimeout(() => {
      this.currentPage.set(1);
      this.fetchProducts();
    }, DEBOUNCE_MS);
  }

  onSortChange(value: string): void {
    this.sortBy.set(value);
    this.currentPage.set(1);
    this.fetchProducts();
  }

  applyPriceFilter(): void {
    this.currentPage.set(1);
    this.fetchProducts();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.sortBy.set('newest');
    this.currentPage.set(1);
    this.fetchProducts();
  }

  // ── Pagination ────────────────────────────────────────────────────────────

  loadPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;
    this.currentPage.set(page);
    this.fetchProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /** Builds a compact page-number list with ellipses, e.g. [1, '…', 4, 5, 6, '…', 12] */
  pageNumbers(): (number | string)[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const delta = 1;
    const pages: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    if (current - delta > 2) pages.push('…');

    const start = Math.max(2, current - delta);
    const end = Math.min(total - 1, current + delta);
    for (let i = start; i <= end; i++) pages.push(i);

    if (current + delta < total - 1) pages.push('…');
    pages.push(total);

    return pages;
  }

  isNumber(value: number | string): value is number {
    return typeof value === 'number';
  }

  trackByPage(index: number, page: number | string): string {
    return `${index}-${page}`;
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
}