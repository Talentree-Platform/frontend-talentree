// src/app/admin/core/services/admin-product.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class AdminProductService extends BaseService {
  
  constructor(http: HttpClient) {
    super(http);
  }

  // جلب كل المنتجات
  getProducts(params?: any): Observable<any> {
    const url = this.getFullUrl('/api/BusinessOwnerProducts');
    return this.get(url, params);
  }

  // جلب منتج واحد
  getProductById(id: number): Observable<any> {
    const url = this.getFullUrl(`/api/BusinessOwnerProducts/${id}`);
    return this.get(url);
  }

  // إضافة منتج
  createProduct(productData: any): Observable<any> {
    const url = this.getFullUrl('/api/BusinessOwnerProducts');
    return this.post(url, productData);
  }

  // تحديث منتج
  updateProduct(id: number, productData: any): Observable<any> {
    const url = this.getFullUrl(`/api/BusinessOwnerProducts/${id}`);
    return this.put(url, productData);
  }

  // حذف منتج
  deleteProduct(id: number): Observable<any> {
    const url = this.getFullUrl(`/api/BusinessOwnerProducts/${id}`);
    return this.delete(url);
  }
}
