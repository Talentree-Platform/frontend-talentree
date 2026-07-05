import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import {
  AdminProduct,
  AdminProductService,
  ProductAnalytics,
  ProductsQuery
} from '../../../core/services/admin-products.service';
import { ChangeCategoryModalComponent } from '../../../Components/change-category-modal/change-category-modal.component';
import { PlatformCategoryService, CategoryOption } from '../../../core/services/platform-category.service';
const API_MEDIA_ORIGIN = '';
const PLACEHOLDER_IMAGE = '/assets/images/placeholder-product.svg';

type StatusFilter = 'all' | 'active' | 'hidden' | 'featured';

@Component({
  selector: 'app-admin-all-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ChangeCategoryModalComponent],
  templateUrl: './admin-all-products.component.html',
  styleUrl: './admin-all-products.component.css'
})
export class AdminAllProductsComponent implements OnInit, OnDestroy {
  private readonly subs = new Subscription();
  private readonly searchInput$ = new Subject<string>();

  products: AdminProduct[] = [];
  loading = false;
  loadError: string | null = null;

  searchQuery = '';
  statusFilter: StatusFilter = 'all';

  pageIndex = 1;
  pageSize = 20;
  totalPages = 1;
  hasNext = false;
  hasPrevious = false;

  /**
   * TODO: wire this up to your real CategoryService (e.g. inject it and call
   * getCategories() in ngOnInit). Left as a plain input here so the modal
   * and this page compile and work standalone in the meantime.
   */
  categories: CategoryOption[] = [];

  // Row-level busy state so buttons disable individually instead of globally.
  private readonly busyIds = new Set<number>();

  selectedForCategory: AdminProduct | null = null;

  showAnalytics = false;
  analytics: ProductAnalytics | null = null;
  analyticsLoading = false;
  analyticsError: string | null = null;

  constructor(
    private readonly adminProductService: AdminProductService,
    private readonly categoryService: PlatformCategoryService,
    private readonly toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
    this.subs.add(
      this.searchInput$.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => {
        this.pageIndex = 1;
        this.loadProducts();
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  onSearchChange(value: string): void {
    this.searchQuery = value;
    this.searchInput$.next(value);
  }

  setStatusFilter(filter: StatusFilter): void {
    this.statusFilter = filter;
  }

  loadProducts(): void {
    this.loading = true;
    this.loadError = null;

    const query: ProductsQuery = {
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      search: this.searchQuery.trim() || undefined
    };

    this.subs.add(
      this.adminProductService.getAllProducts(query).subscribe({
        next: (res) => {
          const payload = res?.data as any;
          this.products = Array.isArray(payload?.data) ? payload.data : [];
          this.totalPages = payload?.totalPages ?? 1;
          this.hasNext = !!payload?.hasNext;
          this.hasPrevious = !!payload?.hasPrevious;
          this.loading = false;
        },
        error: (err: unknown) => {
          this.loading = false;
          this.products = [];
          this.loadError = this.messageFromError(err);
        }
      })
    );
  }
  private loadCategories(): void {
    this.subs.add(
      this.categoryService.getCategoryOptions().subscribe({
        next: (options) => (this.categories = options),
        error: () => this.toastr.error('Could not load categories.', 'Error')
      })
    );
  }
  goToPage(delta: number): void {
    const next = this.pageIndex + delta;
    if (next < 1) return;
    this.pageIndex = next;
    this.loadProducts();
  }

  get filteredProducts(): AdminProduct[] {
    switch (this.statusFilter) {
      case 'active': return this.products.filter((p) => !p.isHidden);
      case 'hidden': return this.products.filter((p) => p.isHidden);
      case 'featured': return this.products.filter((p) => p.isFeatured);
      default: return this.products;
    }
  }

  isBusy(p: AdminProduct): boolean {
    return this.busyIds.has(p.id);
  }

  // ── Hide / Restore ──────────────────────────────────────────────────────────

  toggleHidden(p: AdminProduct): void {
    if (this.isBusy(p)) return;
    this.busyIds.add(p.id);

    const action$ = p.isHidden
      ? this.adminProductService.restoreProduct(p.id)
      : this.adminProductService.hideProduct(p.id);

    action$.subscribe({
      next: (res) => {
        this.busyIds.delete(p.id);
        if (res?.success) {
          p.isHidden = !p.isHidden;
          this.toastr.success(p.isHidden ? 'Product hidden.' : 'Product restored.', 'Talentree', { timeOut: 2000 });
        } else {
          this.toastr.error(res?.message?.trim() || 'Could not update visibility.', 'Error');
        }
      },
      error: (err: unknown) => {
        this.busyIds.delete(p.id);
        this.toastr.error(this.messageFromError(err), 'Error');
      }
    });
  }

  // ── Feature / Unfeature ─────────────────────────────────────────────────────

  toggleFeatured(p: AdminProduct): void {
    if (this.isBusy(p)) return;
    this.busyIds.add(p.id);

    const action$ = p.isFeatured
      ? this.adminProductService.unfeatureProduct(p.id)
      : this.adminProductService.featureProduct(p.id);

    action$.subscribe({
      next: (res) => {
        this.busyIds.delete(p.id);
        if (res?.success) {
          p.isFeatured = !p.isFeatured;
          this.toastr.success(p.isFeatured ? 'Product featured.' : 'Product unfeatured.', 'Talentree', { timeOut: 2000 });
        } else {
          this.toastr.error(res?.message?.trim() || 'Could not update featured status.', 'Error');
        }
      },
      error: (err: unknown) => {
        this.busyIds.delete(p.id);
        this.toastr.error(this.messageFromError(err), 'Error');
      }
    });
  }

  // ── Change Category ──────────────────────────────────────────────────────────

  openChangeCategory(p: AdminProduct): void {
    this.selectedForCategory = p;
  }
  currentCategoryIdFor(p: AdminProduct): number | null {
    const match = this.categories.find((c) => c.name === (p.categoryName || p.category));
    return match ? match.id : null;
  }
  onCategoryModalClosed(): void {
    this.selectedForCategory = null;
  }

  onCategoryChanged(newCategoryId: number): void {
    if (!this.selectedForCategory) return;
    const match = this.categories.find((c) => c.id === newCategoryId);
    if (match) this.selectedForCategory.categoryName = match.name;
  }

  // ── Analytics ────────────────────────────────────────────────────────────────

  openAnalytics(p: AdminProduct): void {
    this.analytics = null;
    this.analyticsError = null;
    this.analyticsLoading = true;
    this.showAnalytics = true;
    this.adminProductService.getProductAnalytics(p.id).subscribe({
      next: (res) => {
        this.analytics = res?.data ?? null;
        this.analyticsLoading = false;
      },
      error: (err: unknown) => {
        this.analyticsError = this.messageFromError(err);
        this.analyticsLoading = false;
      }
    });
  }

  closeAnalytics(): void {
    this.showAnalytics = false;
    this.analytics = null;
  }

  // ── Formatting helpers ─────────────────────────────────────────────────────

  formatMoney(n: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
      Number.isFinite(n) ? n : 0
    );
  }

  imageSrc(p: AdminProduct): string {
    const path = p.mainImageUrl;
    if (!path?.trim()) return PLACEHOLDER_IMAGE;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('//')) return `https:${path}`;
    const base = path.startsWith('/') ? API_MEDIA_ORIGIN : `${API_MEDIA_ORIGIN}/`;
    return `${base}${path}`;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (img) img.src = PLACEHOLDER_IMAGE;
  }

  readonly trackByProductId = (index: number, p: AdminProduct): number => p.id ?? index;

  private messageFromError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error;
      if (typeof body === 'object' && body && 'message' in body)
        return String((body as { message: string }).message);
      if (typeof body === 'string' && body.trim()) return body;
      if (err.status === 401 || err.status === 403)
        return 'You are not allowed to manage products.';
      if (err.status === 404) return 'Endpoint was not found.';
    }
    return 'Something went wrong. Please try again.';
  }
}