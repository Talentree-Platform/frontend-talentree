import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ApproveProductModalComponent } from '../../../Components/approve-product-modal/approve-product-modal.component';
import { RejectProductModalComponent } from '../../../Components/reject-product-modal/reject-product-modal.component';
import { AdminService } from '../../../core/services/admin.service';
import { ApiResponse, PaginatedResponse } from '../../../core/Interfaces/ibusiness-owner';

const API_MEDIA_ORIGIN = 'https://talentreeplateform.runasp.net';
const PLACEHOLDER_IMAGE = '/assets/images/placeholder-product.svg';

@Component({
  selector: 'app-admin-product-home',
  standalone: true,
  imports: [CommonModule, FormsModule, ApproveProductModalComponent, RejectProductModalComponent],
  templateUrl: './admin-product-home.component.html',
  styleUrl: './admin-product-home.component.css'
})
export class AdminProductHomeComponent implements OnInit, OnDestroy {
  private readonly subs = new Subscription();

  products: any[] = [];
  loading = false;
  loadError: string | null = null;
  searchQuery = '';

  /** Row selected for approve / reject modals */
  selectedForApprove: any | null = null;
  selectedForReject: any | null = null;

  private readonly pageIndex = 1;
  private readonly pageSize = 20;

  constructor(private readonly adminService: AdminService) {}

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
      this.adminService.getPendingProducts(this.pageIndex, this.pageSize).subscribe({
        next: (res) => {
          this.products = this.extractProductList(res);
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

  /** Arrow fn so Angular’s differ keeps correct `this` when calling trackBy. */
  readonly trackByProductId = (index: number, p: any): string | number =>
    this.pickId(p) ?? index;

  formatMoney(n: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
      Number.isFinite(n) ? n : 0
    );
  }

  /** Relative time label for created date (e.g. "2h ago"). */
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
    if (img) {
      img.src = PLACEHOLDER_IMAGE;
    }
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
    const sel = this.selectedForApprove;
    if (sel) {
      this.removeProductFromList(sel);
    }
  }

  onApproveModalClosed(): void {
    this.selectedForApprove = null;
  }

  onRejectSuccess(): void {
    const sel = this.selectedForReject;
    if (sel) {
      this.removeProductFromList(sel);
    }
  }

  onRejectModalClosed(): void {
    this.selectedForReject = null;
  }

  private removeProductFromList(product: any): void {
    const id = this.getNumericProductId(product);
    if (id != null) {
      this.products = this.products.filter((x) => this.getNumericProductId(x) !== id);
    } else {
      this.products = this.products.filter((x) => x !== product);
    }
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
    const s = this.pickStr(p, 'createdAt', 'CreatedAt', 'submittedAt', 'SubmittedAt');
    return s || null;
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
    if (v === undefined || v === null) return null;
    return v;
  }

  private pickStr(obj: any, ...keys: string[]): string {
    if (!obj || typeof obj !== 'object') return '';
    for (const k of keys) {
      const v = obj[k];
      if (v !== undefined && v !== null && String(v).trim() !== '') {
        return String(v);
      }
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
      if (typeof body === 'object' && body && 'message' in body) {
        return String((body as { message: string }).message);
      }
      if (typeof body === 'string' && body.trim()) return body;
      if (err.status === 401 || err.status === 403) {
        return 'You are not allowed to view pending products.';
      }
      if (err.status === 404) return 'Pending products endpoint was not found.';
    }
    return 'Could not load pending products. Please try again.';
  }
}
