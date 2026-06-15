import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  FinancialSummary,
  FinancialTransactionFilters,
  FinancialPaginatedTransactions,
  FinancialApiResponse,
} from './financial.models';
import { environment } from '../../../../core/environment/envirinment';

@Injectable({ providedIn: 'root' })
export class FinancialService {
  private readonly base = `${environment.baseUrl}/api/Financial`;

  constructor(private http: HttpClient) {}

  getSummary(from?: string, to?: string): Observable<FinancialSummary> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to)   params = params.set('to', to);
    return this.http
      .get<FinancialApiResponse<FinancialSummary>>(`${this.base}/summary`, { params })
      .pipe(map(r => r.data));
  }

  getTransactions(filters: FinancialTransactionFilters = {}): Observable<FinancialPaginatedTransactions> {
    let params = new HttpParams();
    if (filters.type != null) params = params.set('type', filters.type);
    params = params.set('pageIndex', filters.pageIndex ?? 1);
    params = params.set('pageSize',  filters.pageSize  ?? 20);
    return this.http
      .get<FinancialApiResponse<FinancialPaginatedTransactions>>(`${this.base}/transactions`, { params })
      .pipe(map(r => r.data));
  }
}