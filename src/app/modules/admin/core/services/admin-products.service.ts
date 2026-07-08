import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';
import { ApiResponse, PaginatedResponse } from '../Interfaces/ibusiness-owner';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface AdminProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  status: string;
  sellerName: string;
  sellerId: string;
  images: string[];
  createdAt: string;
  submittedAt: string;
}

export interface ProductAnalytics {
  totalViews: number;
  addToCartCount: number;
  purchaseCount: number;
  conversionRate: number;
  revenueGenerated: number;
}

export interface LowStockProduct {
  id: number;
  name: string;
  sellerName: string;
  stock: number;
  lastSaleDate: string;
}

export interface ProductsQuery {
  pageIndex?: number;
  pageSize?: number;
  status?: string;
  category?: string;
  sellerId?: string;
  search?: string;
}

export interface ApproveProductDto { productId: number; notes?: string; }
export interface RejectProductDto { productId: number; reason: string; }
export interface RequestChangesDto { productId: number; changes: string; }
export interface BulkApproveDto { productIds: number[]; notes?: string; }
export interface BulkRejectDto { productIds: number[]; reason: string; }
export interface ChangeCategoryDto { productId: number; newCategory: string; }

// ─────────────────────────────────────────────────────────────────────────────

@Injectable({
  providedIn: 'root'
})
export class AdminProductService extends BaseService {

  private readonly adminBase = '/api/AdminProduct/products';

  constructor(http: HttpClient, @Inject(PLATFORM_ID) platformId: Object) {
    super(http, platformId);
  }

  // ── Get All / Pending ─────────────────────────────────────────────────────

  getAllProducts(query?: ProductsQuery): Observable<ApiResponse<PaginatedResponse<AdminProduct>>> {
    return this.get(`${this.adminBase}`, query);
  }

  getPendingProducts(pageIndex = 1, pageSize = 20): Observable<ApiResponse<PaginatedResponse<AdminProduct>>> {
    return this.get(`${this.adminBase}/pending`, { pageIndex, pageSize });
  }

  getProductById(id: number): Observable<ApiResponse<AdminProduct>> {
    return this.get(`${this.adminBase}/${id}`);
  }

  // ── Approve / Reject / Request Changes ───────────────────────────────────

  approveProduct(dto: ApproveProductDto): Observable<ApiResponse<string>> {
    return this.post(`${this.adminBase}/approve`, dto);
  }

  rejectProduct(dto: RejectProductDto): Observable<ApiResponse<string>> {
    return this.post(`${this.adminBase}/reject`, dto);
  }

  requestChanges(dto: RequestChangesDto): Observable<ApiResponse<string>> {
    return this.post(`${this.adminBase}/request-changes`, dto);
  }

  // ── Bulk Actions ──────────────────────────────────────────────────────────

  bulkApprove(dto: BulkApproveDto): Observable<ApiResponse<string>> {
    return this.post(`${this.adminBase}/bulk-approve`, dto);
  }

  bulkReject(dto: BulkRejectDto): Observable<ApiResponse<string>> {
    return this.post(`${this.adminBase}/bulk-reject`, dto);
  }

  // ── Hide / Restore ────────────────────────────────────────────────────────

  hideProduct(id: number): Observable<ApiResponse<string>> {
    return this.post(`${this.adminBase}/${id}/hide`, {});
  }

  restoreProduct(id: number): Observable<ApiResponse<string>> {
    return this.post(`${this.adminBase}/${id}/restore`, {});
  }

  // ── Feature / Unfeature ───────────────────────────────────────────────────

  featureProduct(id: number): Observable<ApiResponse<string>> {
    return this.post(`${this.adminBase}/${id}/feature`, {});
  }

  unfeatureProduct(id: number): Observable<ApiResponse<string>> {
    return this.post(`${this.adminBase}/${id}/unfeature`, {});
  }

  // ── Change Category ───────────────────────────────────────────────────────

  changeCategory(dto: ChangeCategoryDto): Observable<ApiResponse<string>> {
    return this.post(`${this.adminBase}/change-category`, dto);
  }

  // ── Analytics ─────────────────────────────────────────────────────────────

  getProductAnalytics(id: number): Observable<ApiResponse<ProductAnalytics>> {
    return this.get(`${this.adminBase}/${id}/analytics`);
  }

  // ── Low Stock ─────────────────────────────────────────────────────────────

  getLowStockProducts(): Observable<ApiResponse<LowStockProduct[]>> {
    return this.get(`${this.adminBase}/low-stock`);
  }

  notifySellerStock(id: number): Observable<ApiResponse<string>> {
    return this.post(`${this.adminBase}/${id}/notify-seller-stock`, {});
  }

  notifyAllLowStock(): Observable<ApiResponse<string>> {
    return this.post(`${this.adminBase}/notify-all-low-stock`, {});
  }
}