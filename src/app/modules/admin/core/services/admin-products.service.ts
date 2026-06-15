import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';
import { environment } from '../../../../core/environment/envirinment';


@Injectable({
  providedIn: 'root'
})
export class AdminProductService extends BaseService {
  
  private readonly adminBase = `${environment.baseUrl}/api/AdminProduct`;

  constructor(http: HttpClient, @Inject(PLATFORM_ID) platformId: Object) {
    super(http, platformId);
  }

  getProducts(params?: any): Observable<any> {
    return this.get(`${this.adminBase}/products/pending`, params);
  }

  approveProduct(productId: number): Observable<any> {
    return this.post(`${this.adminBase}/products/approve`, { productId });
  }

  rejectProduct(productId: number): Observable<any> {
    return this.post(`${this.adminBase}/products/reject`, { productId });
  }
}