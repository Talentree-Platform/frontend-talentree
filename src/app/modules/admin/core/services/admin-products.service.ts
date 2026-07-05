import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';
import { environment } from '../../../../core/environment/envirinment';
import { ApiResponse, PaginatedResponse } from '../Interfaces/ibusiness-owner';

// ── Interfaces ────────────────────────────────────────────────────────────────

/** Full product record returned by GET /api/AdminProduct/products and /products/{id} */
export interface AdminProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  stockQuantity: number;
  category: string;
  categoryName: string;
  status: string;
  isHidden: boolean;
  isFeatured: boolean;
  sellerName: string;
  businessName: string;
  sellerId: string;
  businessOwnerProfileId: number;
  mainImageUrl: string | null;
  images: string[];
  createdAt: string;
  submittedAt: string;
}

export interface ProductsQuery {
  pageIndex?: number;
  pageSize?: number;
  status?: string;
  category?: string;
  sellerId?: string;
  search?: string;
}

export interface ApproveProductDto {
  productId: number;
  notes?: string;
}

export interface RejectProductDto {
  productId: number;
  reason: string;
}

export interface RequestChangesDto {
  productId: number;
  changes: string;
}

export interface BulkApproveDto {
  productIds: number[];
  notes?: string;
}

export interface BulkRejectDto {
  productIds: number[];
  reason: string;
}

export interface ChangeCategoryDto {
  productId: number;
  newCategoryId: number;
}

export interface LowStockProduct {
  productId: number;
  productName: string;
  businessOwnerProfileId: number;
  sellerName: string;
  businessName: string;
  sellerUserId: string;
  categoryName: string;
  currentStock: number;
  lowStockFlag: boolean;
  lastUpdatedAt: string;
  createdAt: string;
}

export interface LowStockQueryParams {
  categoryId?: number;
  businessOwnerProfileId?: number;
  pageIndex?: number;
  pageSize?: number;
}

export interface ProductAnalytics {
  productId: number;
  productName: string;
  totalViews: number;
  addToCartCount: number;
  purchaseCount: number;
  conversionRate: number;
  revenueGenerated: number;
}

// ─────────────────────────────────────────────────────────────────────────────

@Injectable({
  providedIn: 'root'
})
export class AdminProductService extends BaseService {

  private readonly adminBase = `${environment.baseUrl}/api/AdminProduct`;

  constructor(http: HttpClient, @Inject(PLATFORM_ID) platformId: Object) {
    super(http, platformId);
  }

  // ── All Products (browsable / searchable) ──────────────────────────────────

  /**
   * GET /api/AdminProduct/products
   * Retrieves all products with optional filters (status, category, seller, search, pagination).
   */
  getAllProducts(query?: ProductsQuery): Observable<ApiResponse<PaginatedResponse<AdminProduct>>> {
    let p = new HttpParams();
    if (query?.pageIndex != null) p = p.set('pageIndex', String(query.pageIndex));
    if (query?.pageSize  != null) p = p.set('pageSize',  String(query.pageSize));
    if (query?.status)            p = p.set('status',    query.status);
    if (query?.category)          p = p.set('category',  query.category);
    if (query?.sellerId)          p = p.set('sellerId',  query.sellerId);
    if (query?.search)            p = p.set('search',    query.search);
    return this.http.get<ApiResponse<PaginatedResponse<AdminProduct>>>(
      `${this.adminBase}/products`,
      { headers: this.getHeaders(), params: p }
    );
  }

  // ── Single Product ─────────────────────────────────────────────────────────

  /**
   * GET /api/AdminProduct/products/{id}
   * Returns the full detail view of a single product.
   */
  getProductById(id: number): Observable<ApiResponse<AdminProduct>> {
    return this.http.get<ApiResponse<AdminProduct>>(
      `${this.adminBase}/products/${id}`,
      { headers: this.getHeaders() }
    );
  }

  // ── Pending Products ───────────────────────────────────────────────────────

  /** GET /api/AdminProduct/products/pending (via BaseService.get) */
  getProducts(params?: any): Observable<any> {
    return this.get(`${this.adminBase}/products/pending`, params);
  }

  /** GET /api/AdminProduct/products/pending — explicit paginated overload used by product-home */
  getPendingProducts(pageIndex: number, pageSize: number): Observable<ApiResponse<PaginatedResponse<any>>> {
    const p = new HttpParams()
      .set('pageIndex', String(pageIndex))
      .set('pageSize',  String(pageSize));
    return this.http.get<ApiResponse<PaginatedResponse<any>>>(
      `${this.adminBase}/products/pending`,
      { headers: this.getHeaders(), params: p }
    );
  }

  // ── Approve / Reject / Request Changes ────────────────────────────────────

  /** POST /api/AdminProduct/products/approve */
  approveProduct(productId: number, notes?: string): Observable<ApiResponse<string>> {
    return this.post<ApiResponse<string>>(
      `${this.adminBase}/products/approve`,
      { productId, notes: notes ?? '' }
    );
  }

  /** POST /api/AdminProduct/products/reject */
  rejectProduct(productId: number, reason?: string): Observable<ApiResponse<string>> {
    return this.post<ApiResponse<string>>(
      `${this.adminBase}/products/reject`,
      { productId, reason: reason ?? '' }
    );
  }

  /**
   * POST /api/AdminProduct/products/request-changes
   * Sends the product back to the seller with a list of required corrections.
   */
  requestChanges(dto: RequestChangesDto): Observable<ApiResponse<string>> {
    return this.post<ApiResponse<string>>(
      `${this.adminBase}/products/request-changes`,
      dto
    );
  }

  // ── Bulk Actions ───────────────────────────────────────────────────────────

  /**
   * POST /api/AdminProduct/products/bulk-approve
   * Approves a batch of products by their IDs.
   */
  bulkApprove(dto: BulkApproveDto): Observable<ApiResponse<string>> {
    return this.post<ApiResponse<string>>(
      `${this.adminBase}/products/bulk-approve`,
      dto
    );
  }

  /**
   * POST /api/AdminProduct/products/bulk-reject
   * Rejects a batch of products by their IDs.
   */
  bulkReject(dto: BulkRejectDto): Observable<ApiResponse<string>> {
    return this.post<ApiResponse<string>>(
      `${this.adminBase}/products/bulk-reject`,
      dto
    );
  }

  // ── Visibility ─────────────────────────────────────────────────────────────

  /**
   * POST /api/AdminProduct/products/{id}/hide
   * Hides an active product from the storefront.
   */
  hideProduct(id: number): Observable<ApiResponse<string>> {
    return this.post<ApiResponse<string>>(
      `${this.adminBase}/products/${id}/hide`,
      {}
    );
  }

  /**
   * POST /api/AdminProduct/products/{id}/restore
   * Unhides a previously hidden product.
   */
  restoreProduct(id: number): Observable<ApiResponse<string>> {
    return this.post<ApiResponse<string>>(
      `${this.adminBase}/products/${id}/restore`,
      {}
    );
  }

  // ── Featured Catalog ───────────────────────────────────────────────────────

  /**
   * POST /api/AdminProduct/products/{id}/feature
   * Tags a product as featured in the home catalog.
   */
  featureProduct(id: number): Observable<ApiResponse<string>> {
    return this.post<ApiResponse<string>>(
      `${this.adminBase}/products/${id}/feature`,
      {}
    );
  }

  /**
   * POST /api/AdminProduct/products/{id}/unfeature
   * Removes the featured tag from a product.
   */
  unfeatureProduct(id: number): Observable<ApiResponse<string>> {
    return this.post<ApiResponse<string>>(
      `${this.adminBase}/products/${id}/unfeature`,
      {}
    );
  }

  // ── Category ───────────────────────────────────────────────────────────────

  /**
   * POST /api/AdminProduct/products/change-category
   * Reassigns a product to a different category.
   */
  changeCategory(dto: ChangeCategoryDto): Observable<ApiResponse<string>> {
    return this.post<ApiResponse<string>>(
      `${this.adminBase}/products/change-category`,
      dto
    );
  }

  // ── Low Stock ──────────────────────────────────────────────────────────────

  /** GET /api/AdminProduct/products/low-stock */
  getLowStockProducts(params?: LowStockQueryParams): Observable<ApiResponse<PaginatedResponse<LowStockProduct>>> {
    let p = new HttpParams();
    if (params?.categoryId            != null) p = p.set('CategoryId',            params.categoryId);
    if (params?.businessOwnerProfileId != null) p = p.set('BusinessOwnerProfileId', params.businessOwnerProfileId);
    p = p.set('PageIndex', String(params?.pageIndex ?? 1));
    p = p.set('PageSize',  String(params?.pageSize  ?? 20));
    return this.http.get<ApiResponse<PaginatedResponse<LowStockProduct>>>(
      `${this.adminBase}/products/low-stock`,
      { headers: this.getHeaders(), params: p }
    );
  }

  /** POST /api/AdminProduct/products/{id}/notify-seller-stock */
  notifySellerStock(productId: number): Observable<ApiResponse<string>> {
    return this.post<ApiResponse<string>>(
      `${this.adminBase}/products/${productId}/notify-seller-stock`,
      {}
    );
  }

  /** POST /api/AdminProduct/products/notify-all-low-stock */
  notifyAllLowStock(): Observable<ApiResponse<string>> {
    return this.post<ApiResponse<string>>(
      `${this.adminBase}/products/notify-all-low-stock`,
      {}
    );
  }

  // ── Analytics ──────────────────────────────────────────────────────────────

  /** GET /api/AdminProduct/products/{id}/analytics */
  getProductAnalytics(productId: number): Observable<ApiResponse<ProductAnalytics>> {
    return this.get<ApiResponse<ProductAnalytics>>(
      `${this.adminBase}/products/${productId}/analytics`
    );
  }
}