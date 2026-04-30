import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class AdminProductService extends BaseService {
  
  constructor(http: HttpClient, @Inject(PLATFORM_ID) platformId: Object) {
    super(http, platformId);
  }

  // جلب المنتجات المعلقة
  getProducts(params?: any): Observable<any> {
    const url = this.getFullUrl('/api/AdminProduct/products/pending');
    return this.get(url, params);
  }

  // موافقة على منتج
  approveProduct(productId: number): Observable<any> {
    const url = this.getFullUrl('/api/AdminProduct/products/approve');
    return this.post(url, { productId });
  }

  // رفض منتج
  rejectProduct(productId: number): Observable<any> {
    const url = this.getFullUrl('/api/AdminProduct/products/reject');
    return this.post(url, { productId });
  }
}