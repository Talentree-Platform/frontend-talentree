import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ApproveProductModalComponent } from '../../../Components/approve-product-modal/approve-product-modal.component';
import { RejectProductModalComponent } from '../../../Components/reject-product-modal/reject-product-modal.component';
import { RequestChangesModalComponent } from '../../../Components/request-changes-modal/request-changes-modal.component';
import { BulkApproveModalComponent } from '../../../Components/bulk-approve-modal/bulk-approve-modal.component';
import { BulkRejectModalComponent } from '../../../Components/bulk-reject-modal/bulk-reject-modal.component';
import { AdminProductService, LowStockProduct, ProductAnalytics } from '../../../core/services/admin-products.service';
import { ApiResponse, PaginatedResponse } from '../../../core/Interfaces/ibusiness-owner';
import { ToastrService } from 'ngx-toastr';

const API_MEDIA_ORIGIN = '';
const PLACEHOLDER_IMAGE = '/assets/images/placeholder-product.svg';

@Component({
  selector: 'app-admin-product-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ApproveProductModalComponent,
    RejectProductModalComponent,
    RequestChangesModalComponent,
    BulkApproveModalComponent,
    BulkRejectModalComponent
  ],
  templateUrl: './admin-product-home.component.html',
  styleUrl: './admin-product-home.component.css'
})
export class AdminProductHomeComponent implements OnInit, OnDestroy {
  private readonly subs = new Subscription();

  products: any[] = [];
  loading = false;
  loadError: string | null = null;
  searchQuery = '';

  selectedForApprove: any | null = null;
  selectedForReject: any | null = null;
  selectedForRequestChanges: any | null = null;

  // ── Bulk selection ─────────────────────────────────────────────────────────
  selectedIds = new Set<number>();
  showBulkApprove = false;
  showBulkReject = false;

  private readonly pageIndex = 1;
  private readonly pageSize = 20;

  // ── Analytics & Low Stock ─────────────────────────────────────────────────
  showAnalytics = false;
  analyticsProductId: number | null = null;
  analytics: ProductAnalytics | null = null;
  analyticsLoading = false;
  analyticsError: string | null = null;

  lowStockProducts: LowStockProduct[] = [];
  lowStockLoading = false;
  lowStockError: string | null = null;
  showLowStock = false;

  constructor(
    private readonly adminProductService: AdminProductService,
    private readonly toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadProducts();
    this.loadLowStock();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadProducts(): void {
    this.loading = true;
    this.loadError = null;

    this.subs.add(
      this.adminProductService.getPendingProducts(this.pageIndex, this.pageSize).subscribe({
        next: (res) => {
          this.products = this.extractProductList(res);
          this.selectedIds.clear();
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

  // ── Bulk selection ─────────────────────────────────────────────────────────

  isSelected(p: any): boolean {
    const id = this.getNumericProductId(p);
    return id != null && this.selectedIds.has(id);
  }

  toggleSelect(p: any, checked: boolean): void {
    const id = this.getNumericProductId(p);
    if (id == null) return;
    if (checked) this.selectedIds.add(id);
    else this.selectedIds.delete(id);
  }

  get allVisibleSelected(): boolean {
    const visible = this.filteredProducts;
    if (visible.length === 0) return false;
    return visible.every((p) => this.isSelected(p));
  }

  toggleSelectAll(checked: boolean): void {
    for (const p of this.filteredProducts) {
      const id = this.getNumericProductId(p);
      if (id == null) continue;
      if (checked) this.selectedIds.add(id);
      else this.selectedIds.delete(id);
    }
  }

  get selectedCount(): number {
    return this.selectedIds.size;
  }

  clearSelection(): void {
    this.selectedIds.clear();
  }

  openBulkApprove(): void {
    if (this.selectedCount === 0) return;
    this.showBulkApprove = true;
  }

  openBulkReject(): void {
    if (this.selectedCount === 0) return;
    this.showBulkReject = true;
  }

  onBulkApproveModalClosed(): void {
    this.showBulkApprove = false;
  }

  onBulkRejectModalClosed(): void {
    this.showBulkReject = false;
  }

  onBulkApproveSuccess(ids: number[]): void {
    this.removeProductsFromList(ids);
  }

  onBulkRejectSuccess(ids: number[]): void {
    this.removeProductsFromList(ids);
  }

  get selectedProductIds(): number[] {
    return Array.from(this.selectedIds);
  }

  // ── Request Changes ────────────────────────────────────────────────────────

  openRequestChanges(event: Event, product: any): void {
    event.stopPropagation();
    this.selectedForRequestChanges = product;
  }

  onRequestChangesModalClosed(): void {
    this.selectedForRequestChanges = null;
  }

  onRequestChangesSuccess(): void {
    if (this.selectedForRequestChanges) this.removeProductFromList(this.selectedForRequestChanges);
  }

  // ── Low Stock ──────────────────────────────────────────────────────────────

  loadLowStock(): void {
    this.lowStockLoading = true;
    this.lowStockError = null;
    this.subs.add(
      this.adminProductService.getLowStockProducts({ pageIndex: 1, pageSize: 50 }).subscribe({
        next: (res) => {
          this.lowStockProducts = res?.data?.data ?? [];
          this.lowStockLoading = false;
        },
        error: (err: unknown) => {
          this.lowStockLoading = false;
          this.lowStockError = this.messageFromError(err);
        }
      })
    );
  }

  toggleLowStock(): void { this.showLowStock = !this.showLowStock; }

  notifySeller(productId: number): void {
    this.adminProductService.notifySellerStock(productId).subscribe({
      next: () => this.toastr.success('Seller notified about low stock.', 'Talentree', { timeOut: 2000 }),
      error: () => this.toastr.error('Failed to send notification.', 'Talentree', { timeOut: 2000 }),
    });
  }

  notifyAll(): void {
    this.adminProductService.notifyAllLowStock().subscribe({
      next: () => this.toastr.success('All low-stock sellers notified.', 'Talentree', { timeOut: 2000 }),
      error: () => this.toastr.error('Failed to send notifications.', 'Talentree', { timeOut: 2000 }),
    });
  }

  // ── Per-product Analytics ──────────────────────────────────────────────────

  openAnalytics(p: any): void {
    const id = this.getNumericProductId(p);
    if (!id) return;
    this.analyticsProductId = id;
    this.analytics = null;
    this.analyticsError = null;
    this.analyticsLoading = true;
    this.showAnalytics = true;
    this.subs.add(
      this.adminProductService.getProductAnalytics(id).subscribe({
        next: (res) => {
          this.analytics = res?.data ?? null;
          this.analyticsLoading = false;
        },
        error: (err: unknown) => {
          this.analyticsError = this.messageFromError(err);
          this.analyticsLoading = false;
        }
      })
    );
  }

  closeAnalytics(): void { this.showAnalytics = false; this.analytics = null; this.analyticsProductId = null; }

  get filteredProducts(): any[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.products;
    return this.products.filter((p) => {
      const name = this.pickName(p).toLowerCase();
      const cat = this.pickCategory(p).toLowerCase();
      const biz = this.pickBusinessName(p).toLowerCase();
      return name.includes(q) || cat.includes(q) || biz.includes(q);
    });
  }

  readonly trackByProductId = (index: number, p: any): string | number =>
    this.pickId(p) ?? index;

  formatMoney(n: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
      Number.isFinite(n) ? n : 0
    );
  }

  timeAgo(iso: string | null | undefined): string {
    if (!iso) return '—';
    const t = new Date(iso).getTime();
    if (Number.isNaN(t)) return '—';
    let sec = Math.floor((Date.now() - t) / 1000);
    if (sec < 0) sec = 0;
    if (sec < 60) return 'just now';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const day = Math.floor(hr / 24);
    if (day < 30) return `${day}d ago`;
    const mo = Math.floor(day / 30);
    if (mo < 12) return `${mo}mo ago`;
    const yr = Math.floor(day / 365);
    return `${yr}y ago`;
  }

  imageSrc(p: any): string {
    const path = this.pickStr(p, 'mainImageUrl', 'MainImageUrl', 'imageUrl', 'ImageUrl');
    if (!path?.trim()) return PLACEHOLDER_IMAGE;
    return this.fullImageUrl(path.trim());
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (img) img.src = PLACEHOLDER_IMAGE;
  }

  onApprove(event: Event, product: any): void {
    event.stopPropagation();
    this.selectedForApprove = product;
  }

  onReject(event: Event, product: any): void {
    event.stopPropagation();
    this.selectedForReject = product;
  }

  getNumericProductId(p: any): number | null {
    const v = p?.id ?? p?.Id ?? p?.productId ?? p?.ProductId;
    if (v === undefined || v === null) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  onApproveSuccess(): void {
    if (this.selectedForApprove) this.removeProductFromList(this.selectedForApprove);
  }

  onApproveModalClosed(): void {
    this.selectedForApprove = null;
  }

  onRejectSuccess(): void {
    if (this.selectedForReject) this.removeProductFromList(this.selectedForReject);
  }

  onRejectModalClosed(): void {
    this.selectedForReject = null;
  }

  private removeProductFromList(product: any): void {
    const id = this.getNumericProductId(product);
    if (id != null) {
      this.products = this.products.filter((x) => this.getNumericProductId(x) !== id);
      this.selectedIds.delete(id);
    } else {
      this.products = this.products.filter((x) => x !== product);
    }
  }

  private removeProductsFromList(ids: number[]): void {
    const idSet = new Set(ids);
    this.products = this.products.filter((x) => {
      const id = this.getNumericProductId(x);
      return id == null || !idSet.has(id);
    });
    for (const id of ids) this.selectedIds.delete(id);
  }

  pickName(p: any): string {
    return this.pickStr(p, 'name', 'Name', 'productName', 'ProductName') || '—';
  }

  pickCategory(p: any): string {
    return this.pickStr(p, 'categoryName', 'CategoryName', 'category', 'Category') || '—';
  }

  pickPrice(p: any): number {
    return this.pickNum(p, 'price', 'Price', 'sellingPrice', 'SellingPrice');
  }

  pickStock(p: any): number {
    return Math.round(this.pickNum(p, 'stockQuantity', 'StockQuantity', 'stock', 'Stock'));
  }

  pickBusinessName(p: any): string {
    const primary = this.pickStr(p, 'businessName', 'BusinessName', 'storeName', 'StoreName');
    if (primary) return primary;
    return this.pickStr(p, 'ownerName', 'OwnerName', 'sellerName', 'SellerName') || '—';
  }

  pickCreatedAt(p: any): string | null {
    return this.pickStr(p, 'createdAt', 'CreatedAt', 'submittedAt', 'SubmittedAt') || null;
  }

  private extractProductList(res: ApiResponse<PaginatedResponse<unknown> | unknown>): any[] {
    const payload = res?.data as any;
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.data)) return payload.data;
    return [];
  }

  private pickId(p: any): number | string | null {
    const id = this.getNumericProductId(p);
    if (id != null) return id;
    const v = p?.id ?? p?.Id ?? p?.productId ?? p?.ProductId;
    return v ?? null;
  }

  private pickStr(obj: any, ...keys: string[]): string {
    if (!obj || typeof obj !== 'object') return '';
    for (const k of keys) {
      const v = obj[k];
      if (v !== undefined && v !== null && String(v).trim() !== '') return String(v);
    }
    return '';
  }

  private pickNum(obj: any, ...keys: string[]): number {
    if (!obj || typeof obj !== 'object') return 0;
    for (const k of keys) {
      const v = obj[k];
      if (typeof v === 'number' && !Number.isNaN(v)) return v;
      if (typeof v === 'string' && v.trim() !== '') {
        const n = Number(v);
        if (!Number.isNaN(n)) return n;
      }
    }
    return 0;
  }

  private fullImageUrl(path: string): string {
    if (!path) return PLACEHOLDER_IMAGE;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('//')) return `https:${path}`;
    const base = path.startsWith('/') ? API_MEDIA_ORIGIN : `${API_MEDIA_ORIGIN}/`;
    return `${base}${path}`;
  }

  private messageFromError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error;
      if (typeof body === 'object' && body && 'message' in body)
        return String((body as { message: string }).message);
      if (typeof body === 'string' && body.trim()) return body;
      if (err.status === 401 || err.status === 403)
        return 'You are not allowed to view pending products.';
      if (err.status === 404) return 'Pending products endpoint was not found.';
    }
    return 'Could not load pending products. Please try again.';
  }
}