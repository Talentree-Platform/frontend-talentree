import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';
import { environment } from '../../../../core/environment/envirinment';
import { ApiResponse, PaginatedResponse } from '../Interfaces/ibusiness-owner';

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

@Injectable({
  providedIn: 'root'
})
export class AdminProductService extends BaseService {

  private readonly adminBase = `${environment.baseUrl}/api/AdminProduct`;

  constructor(http: HttpClient, @Inject(PLATFORM_ID) platformId: Object) {
    super(http, platformId);
  }

  /** GET pending products (paginated) */
  getProducts(params?: any): Observable<any> {
    return this.get(`${this.adminBase}/products/pending`, params);
  }

  /** Alias used by product-home component */
  getPendingProducts(pageIndex: number, pageSize: number): Observable<ApiResponse<PaginatedResponse<any>>> {
    const p = new HttpParams()
      .set('pageIndex', String(pageIndex))
      .set('pageSize', String(pageSize));
    return this.http.get<ApiResponse<PaginatedResponse<any>>>(
      `${this.adminBase}/products/pending`,
      { headers: this.getHeaders(), params: p }
    );
  }

  approveProduct(productId: number, notes?: string): Observable<any> {
    return this.post(`${this.adminBase}/products/approve`, { productId, notes: notes ?? '' });
  }

  rejectProduct(productId: number, reason?: string): Observable<any> {
    return this.post(`${this.adminBase}/products/reject`, { productId, reason: reason ?? '' });
  }

  getLowStockProducts(params?: LowStockQueryParams): Observable<ApiResponse<PaginatedResponse<LowStockProduct>>> {
    let p = new HttpParams();
    if (params?.categoryId != null) p = p.set('CategoryId', params.categoryId);
    if (params?.businessOwnerProfileId != null) p = p.set('BusinessOwnerProfileId', params.businessOwnerProfileId);
    p = p.set('PageIndex', String(params?.pageIndex ?? 1));
    p = p.set('PageSize', String(params?.pageSize ?? 20));
    return this.http.get<ApiResponse<PaginatedResponse<LowStockProduct>>>(
      `${this.adminBase}/products/low-stock`,
      { headers: this.getHeaders(), params: p }
    );
  }

  notifySellerStock(productId: number): Observable<any> {
    return this.post(`${this.adminBase}/products/${productId}/notify-seller-stock`, {});
  }

  notifyAllLowStock(): Observable<any> {
    return this.post(`${this.adminBase}/products/notify-all-low-stock`, {});
  }

  getProductAnalytics(productId: number): Observable<ApiResponse<ProductAnalytics>> {
    return this.get(`${this.adminBase}/products/${productId}/analytics`);
  }

  /** Used by admin-platform to list all products for featured selection */
  getAllProducts(pageIndex = 1, pageSize = 50): Observable<any> {
    const p = new HttpParams()
      .set('pageIndex', String(pageIndex))
      .set('pageSize', String(pageSize));
    return this.http.get<any>(
      `${this.adminBase}/products/all`,
      { headers: this.getHeaders(), params: p }
    );
  }
}