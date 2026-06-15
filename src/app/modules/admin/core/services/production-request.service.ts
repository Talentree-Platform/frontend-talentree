import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../core/environment/envirinment';

export interface ProductionRequest {
  id: number;
  status: number;
  statusText?: string | null;
  quotedPrice?: number | null;
  estimatedCompletionDate?: string | null;
  adminNotes?: string | null;
  rejectionReason?: string | null;
  productId?: number;
  productName?: string | null;
  businessOwnerId?: number;
  businessOwnerName?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
  errors: unknown;
  timestamp: string;
}

export interface PagedList<T> {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: T[];
}

export interface QuotePayload {
  quotedPrice: number;
  estimatedCompletionDate: string;
  adminNotes: string;
}

export interface CompletePayload {
  adminNotes: string;
}

export interface RejectPayload {
  reason: string;
}

export const STATUS_MAP: Record<number, { label: string; color: string; bg: string }> = {
  0: { label: 'Pending',    color: '#92680a', bg: '#fef3c7' },
  1: { label: 'Reviewed',   color: '#1e4fa3', bg: '#dbeafe' },
  2: { label: 'Quoted',     color: '#6b21a8', bg: '#f3e8ff' },
  3: { label: 'Confirmed',  color: '#0e7490', bg: '#cffafe' },
  4: { label: 'Started',    color: '#065f46', bg: '#d1fae5' },
  5: { label: 'Completed',  color: '#166534', bg: '#dcfce7' },
  6: { label: 'Rejected',   color: '#991b1b', bg: '#fee2e2' },
  7: { label: 'Cancelled',  color: '#374151', bg: '#f3f4f6' },
};

@Injectable({ providedIn: 'root' })
export class ProductionRequestService {
  private readonly base = `${environment.baseUrl}/api/AdminProductionRequest`;
  //  private readonly base ='/api/AdminProductionRequest'

  constructor(private http: HttpClient) {}

  getAll(
    status?: number,
    pageIndex = 1,
    pageSize = 20
  ): Observable<ApiResponse<PagedList<ProductionRequest>>> {
    let params = new HttpParams()
      .set('pageIndex', String(pageIndex))
      .set('pageSize', String(pageSize))
      .set('_t', String(Date.now()));

    if (status !== undefined && status !== null) {
      params = params.set('status', String(status));
    }

    return this.http.get<ApiResponse<PagedList<ProductionRequest>>>(this.base, { params });
  }

  getById(id: number): Observable<ProductionRequest> {
    return this.http
      .get<ApiResponse<ProductionRequest>>(`${this.base}/${id}`)
      .pipe(map((res) => res.data));
  }

  review(id: number): Observable<ApiResponse<unknown>> {
    return this.http.put<ApiResponse<unknown>>(`${this.base}/${id}/review`, {});
  }

  quote(id: number, payload: QuotePayload): Observable<ApiResponse<unknown>> {
    return this.http.put<ApiResponse<unknown>>(`${this.base}/${id}/quote`, payload);
  }

  start(id: number): Observable<ApiResponse<unknown>> {
    return this.http.put<ApiResponse<unknown>>(`${this.base}/${id}/start`, {});
  }

  complete(id: number, payload: CompletePayload): Observable<ApiResponse<unknown>> {
    return this.http.put<ApiResponse<unknown>>(`${this.base}/${id}/complete`, payload);
  }

  reject(id: number, payload: RejectPayload): Observable<ApiResponse<unknown>> {
    return this.http.put<ApiResponse<unknown>>(`${this.base}/${id}/reject`, payload);
  }
}