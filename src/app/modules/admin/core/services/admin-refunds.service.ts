import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export enum RefundStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
}

export interface RefundRequestDto {
  id: number;
  orderId?: number | null;
  customerName?: string | null;
  customerEmail?: string | null;
  amount?: number | null;
  reason?: string | null;
  status: RefundStatus;
  statusText?: string | null;
  adminNotes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

/**
 * The /api/AdminRefunds list endpoint returns this shape directly (no ApiResponse wrapper).
 */
export interface PagedList<T> {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: T[];
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  firstItemIndex: number;
  lastItemIndex: number;
}

/**
 * Approve / Reject endpoints may return a simple ApiResponse wrapper.
 * We keep this loose so both patterns work.
 */
export interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  message?: string | null;
  errors?: unknown;
  timestamp?: string;
}

export const REFUND_STATUS_MAP: Record<number, { label: string; color: string; bg: string }> = {
  [RefundStatus.Pending]:  { label: 'Pending',  color: '#92400e', bg: '#fef3c7' },
  [RefundStatus.Approved]: { label: 'Approved', color: '#065f46', bg: '#d1fae5' },
  [RefundStatus.Rejected]: { label: 'Rejected', color: '#991b1b', bg: '#fee2e2' },
};

@Injectable({ providedIn: 'root' })
export class AdminRefundsService {

  private readonly base = '/api/AdminRefunds';

  constructor(private http: HttpClient) {}

  /**
   * GET /api/AdminRefunds
   * Returns a PagedList directly (no ApiResponse wrapper).
   */
  getRefunds(
    status?: number,
    pageIndex = 1,
    pageSize = 20
  ): Observable<PagedList<RefundRequestDto>> {
    let params = new HttpParams()
      .set('pageIndex', String(pageIndex))
      .set('pageSize', String(pageSize))
      .set('_t', String(Date.now()));

    if (status !== undefined && status !== null) {
      params = params.set('status', String(status));
    }

    return this.http.get<PagedList<RefundRequestDto>>(this.base, { params });
  }

  /** POST /api/AdminRefunds/{id}/approve */
  approveRefund(id: number): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.base}/${id}/approve`, {});
  }

  /** POST /api/AdminRefunds/{id}/reject */
  rejectRefund(id: number): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.base}/${id}/reject`, {});
  }
}
