import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { OwnerProduct, OwnerProductStatus } from '../../../core/interfaces/owner-product';
import { BusinessOwnerProductsService } from '../../../core/services/business-owner-products.service';

export type SummaryCardFilter = 'all' | 'under_review' | 'low_stock' | 'top_selling';

@Component({
  selector: 'app-owner-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './owner-products.component.html',
  styleUrls: ['./owner-products.component.css']
})
export class OwnerProductsComponent implements OnInit, OnDestroy {
  private readonly subs = new Subscription();
  private readonly lowStockMax = 5;

  products: OwnerProduct[] = [];
  loading = false;
  loadError: string | null = null;

  searchQuery = '';
  statusFilter: OwnerProductStatus | 'all' = 'all';
  categoryFilter = 'all';
  priceRange: 'all' | 'under25' | '25-100' | '100-500' | '500plus' = 'all';
  sortBy: 'date' | 'sales' | 'priceAsc' | 'priceDesc' = 'date';

  summaryCardFilter: SummaryCardFilter = 'all';

  viewMode: 'table' | 'grid' = 'table';

  productPendingDelete: OwnerProduct | null = null;
  /** Numeric id for DELETE /api/BusinessOwnerProducts/{id} */
  selectedProductId: number | null = null;
  isDeleting = false;
  productStats: OwnerProduct | null = null;

  readonly statusOptions: { value: OwnerProductStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All statuses' },
    { value: 'active', label: 'Active' },
    { value: 'draft', label: 'Draft' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'out_of_stock', label: 'Out of Stock' }
  ];

  constructor(
    private readonly productsApi: BusinessOwnerProductsService,
    private readonly router: Router,
    private readonly toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadProducts(): void {
    this.loading = true;
    this.loadError = null;
    this.subs.add(
      this.productsApi.getProducts().subscribe({
        next: (list) => {
          this.products = list;
          this.loading = false;
        },
        error: () => {
          this.products = this.getMockProducts();
          this.loadError = 'Using sample data — could not reach the server.';
          this.loading = false;
        }
      })
    );
  }

  get categories(): string[] {
    const set = new Set<string>();
    this.products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['all', ...Array.from(set).sort()];
  }

  get totalListed(): number {
    return this.products.length;
  }

  get underReviewCount(): number {
    return this.products.filter((p) => p.status === 'under_review').length;
  }

  get lowStockCount(): number {
    return this.products.filter((p) => p.stock <= this.lowStockMax && p.stock >= 0).length;
  }

  get topSellingProduct(): OwnerProduct | null {
    if (!this.products.length) return null;
    return [...this.products].reduce((a, b) => (a.sales >= b.sales ? a : b));
  }

  get filteredProducts(): OwnerProduct[] {
    let list = [...this.products];

    if (this.summaryCardFilter === 'under_review') {
      list = list.filter((p) => p.status === 'under_review');
    } else if (this.summaryCardFilter === 'low_stock') {
      list = list.filter((p) => p.stock <= this.lowStockMax);
    } else if (this.summaryCardFilter === 'top_selling') {
      const top = this.topSellingProduct;
      list = top ? list.filter((p) => p.id === top.id) : [];
    }

    if (this.statusFilter !== 'all') {
      list = list.filter((p) => p.status === this.statusFilter);
    }

    if (this.categoryFilter !== 'all') {
      list = list.filter((p) => p.category === this.categoryFilter);
    }

    switch (this.priceRange) {
      case 'under25':
        list = list.filter((p) => p.price < 25);
        break;
      case '25-100':
        list = list.filter((p) => p.price >= 25 && p.price <= 100);
        break;
      case '100-500':
        list = list.filter((p) => p.price > 100 && p.price <= 500);
        break;
      case '500plus':
        list = list.filter((p) => p.price > 500);
        break;
    }

    const q = this.searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    switch (this.sortBy) {
      case 'sales':
        list.sort((a, b) => b.sales - a.sales);
        break;
      case 'priceAsc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        list.sort((a, b) => b.price - a.price);
        break;
      default:
        list.sort((a, b) => (b.dateAdded || '').localeCompare(a.dateAdded || ''));
    }

    return list;
  }

  setSummaryFilter(filter: SummaryCardFilter): void {
    this.summaryCardFilter = filter;
  }

  isSummaryActive(filter: SummaryCardFilter): boolean {
    return this.summaryCardFilter === filter;
  }

  addProduct(): void {
    void this.router.navigate(['/businessowner/ownerAddProduct']);
  }

  goToDetails(p: OwnerProduct): void {
    const id = Number(p.id);
    if (Number.isNaN(id)) {
      this.toastr.warning('This listing cannot be opened — missing product id.', 'Details');
      return;
    }
    void this.router.navigate(['/businessowner/owner/products', id]);
  }

  editProduct(p: OwnerProduct): void {
    const id = Number(p.id);
    if (Number.isNaN(id)) {
      this.toastr.warning('Missing product id.', 'Edit');
      return;
    }
    void this.router.navigate(['/businessowner/ownerEditProduct', id]);
  }

  openDeleteModal(p: OwnerProduct): void {
    this.productPendingDelete = p;
    const n = Number(p.id);
    this.selectedProductId = Number.isFinite(n) ? n : null;
  }

  closeDeleteModal(): void {
    if (this.isDeleting) return;
    this.productPendingDelete = null;
    this.selectedProductId = null;
  }

  confirmDelete(): void {
    if (this.selectedProductId == null || !this.productPendingDelete) return;
    if (this.isDeleting) return;

    this.isDeleting = true;

    this.subs.add(
      this.productsApi.deleteProduct(this.selectedProductId).subscribe({
        next: () => {
          this.isDeleting = false;
          const sid = this.selectedProductId!;
          this.products = this.products.filter((p) => Number(p.id) !== sid);
          this.toastr.success('Product removed from your list.', 'Deleted');
          this.closeDeleteModal();
        },
        error: (err: unknown) => {
          this.isDeleting = false;
          this.handleDeleteError(err);
        }
      })
    );
  }

  private handleDeleteError(err: unknown): void {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 403) {
        this.toastr.error('You are not allowed to delete this product.', 'Not allowed');
      } else if (err.status === 404) {
        this.toastr.error('Product not found.', 'Delete failed');
      } else {
        this.toastr.error(this.messageFromHttpError(err) ?? 'Could not delete this product.', 'Delete failed');
      }
    } else {
      this.toastr.error('Could not delete this product.', 'Delete failed');
    }
  }

  private messageFromHttpError(err: HttpErrorResponse): string | null {
    const body = err.error;
    if (typeof body === 'object' && body && 'message' in body) {
      return String((body as { message: string }).message);
    }
    if (typeof body === 'string' && body.trim()) return body;
    return err.message || null;
  }

  openStatsModal(p: OwnerProduct): void {
    this.productStats = p;
  }

  closeStatsModal(): void {
    this.productStats = null;
  }

  duplicateProduct(p: OwnerProduct): void {
    const copy: OwnerProduct = {
      ...p,
      id: `copy-${Date.now()}`,
      name: `${p.name} (Copy)`,
      sku: `${p.sku}-COPY`,
      status: 'draft',
      sales: 0,
      views: 0,
      dateAdded: new Date().toISOString().slice(0, 10)
    };
    this.products = [copy, ...this.products];
    this.toastr.success('A draft copy was added to your list.', 'Duplicated');
  }

  async shareProduct(p: OwnerProduct): Promise<void> {
    const text = `${p.name} — ${this.formatMoney(p.price)}`;
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) {
        await navigator.share({ title: p.name, text, url });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        this.toastr.info('Link copied to clipboard.', 'Share');
      } else {
        this.toastr.warning('Sharing is not supported in this browser.', 'Share');
      }
    } catch {
      /* user cancelled share */
    }
  }

  formatMoney(n: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
  }

  statusLabel(s: OwnerProductStatus): string {
    const m: Record<OwnerProductStatus, string> = {
      active: 'Active',
      draft: 'Draft',
      under_review: 'Under Review',
      rejected: 'Rejected',
      out_of_stock: 'Out of Stock'
    };
    return m[s] ?? s;
  }

  stopRowClick(ev: Event): void {
    ev.stopPropagation();
  }

  private getMockProducts(): OwnerProduct[] {
    const img = (seed: number) => `https://picsum.photos/seed/bo${seed}/120/120`;
    return [
      {
        id: '1',
        sku: 'SKU-1001',
        name: 'Organic Cotton Tee',
        category: 'Apparel',
        price: 29.99,
        stock: 120,
        status: 'active',
        sales: 842,
        rating: 4.7,
        imageUrl: img(1),
        dateAdded: '2025-01-10',
        views: 12040
      },
      {
        id: '2',
        sku: 'SKU-2044',
        name: 'Handmade Ceramic Mug',
        category: 'Home',
        price: 18.5,
        stock: 3,
        status: 'active',
        sales: 210,
        rating: 4.9,
        imageUrl: img(2),
        dateAdded: '2025-02-02',
        views: 3200
      },
      {
        id: '3',
        sku: 'SKU-3090',
        name: 'Linen Table Runner',
        category: 'Home',
        price: 45,
        stock: 0,
        status: 'out_of_stock',
        sales: 56,
        rating: 4.2,
        imageUrl: img(3),
        dateAdded: '2024-11-20',
        views: 890
      },
      {
        id: '4',
        sku: 'SKU-4122',
        name: 'Artisan Soap Set',
        category: 'Beauty',
        price: 22,
        stock: 80,
        status: 'under_review',
        sales: 0,
        rating: 0,
        imageUrl: img(4),
        dateAdded: '2025-03-01',
        views: 45
      },
      {
        id: '5',
        sku: 'SKU-5001',
        name: 'Wool Scarf',
        category: 'Apparel',
        price: 64,
        stock: 2,
        status: 'active',
        sales: 430,
        rating: 4.5,
        imageUrl: img(5),
        dateAdded: '2024-09-15',
        views: 6700
      },
      {
        id: '6',
        sku: 'SKU-6003',
        name: 'Draft Listing Sample',
        category: 'Misc',
        price: 10,
        stock: 50,
        status: 'draft',
        sales: 0,
        rating: 0,
        imageUrl: '',
        dateAdded: '2025-03-12',
        views: 0
      },
      {
        id: '7',
        sku: 'SKU-7007',
        name: 'Rejected Item Demo',
        category: 'Misc',
        price: 99,
        stock: 10,
        status: 'rejected',
        sales: 12,
        rating: 3.1,
        imageUrl: img(7),
        dateAdded: '2024-06-01',
        views: 200
      },
      {
        id: '8',
        sku: 'SKU-8080',
        name: 'Bestseller Hoodie',
        category: 'Apparel',
        price: 59.99,
        stock: 200,
        status: 'active',
        sales: 1205,
        rating: 4.8,
        imageUrl: img(8),
        dateAdded: '2024-05-01',
        views: 25000
      }
    ];
  }
}
