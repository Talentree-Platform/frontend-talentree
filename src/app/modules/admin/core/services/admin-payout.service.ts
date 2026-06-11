import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Payout, PayoutListResponse } from '../Interfaces/iadmin-payout';

@Injectable({ providedIn: 'root' })
export class PayoutAdminService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/Payout/admin';

  getPayouts(
    pageIndex: number,
    pageSize: number,
    status?: number | null
  ): Observable<PayoutListResponse> {
    let params = new HttpParams()
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize);

    if (status !== null && status !== undefined) {
      params = params.set('status', status);
    }

    return this.http.get<PayoutListResponse>(this.base, { params });
  }

  approve(id: number): Observable<Payout> {
    return this.http.put<Payout>(`${this.base}/${id}/approve`, {});
  }

  complete(id: number): Observable<Payout> {
    return this.http.put<Payout>(`${this.base}/${id}/complete`, {});
  }

  reject(id: number, reason: string): Observable<Payout> {
    return this.http.put<Payout>(`${this.base}/${id}/reject`, { reason });
  }
}