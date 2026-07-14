import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AiDashboardOverview } from '../../models/dashboard.model';
import { RevenueAnalyticsResponse, ReviewTrendsResponse } from '../../models/analytics.model';
import { BenchmarkResponse, FinancialExportOptions } from '../../models/ai-tools.model';
import { environment } from '../../../../core/environment/envirinment';

@Injectable({
  providedIn: 'root'
})
export class AiDashboardService {
  private readonly baseUrl = `${environment.baseUrl}/api/bo/ai`;

  constructor(private http: HttpClient) {}

  getDashboardOverview(): Observable<AiDashboardOverview> {
    return this.http.get<AiDashboardOverview>(`${this.baseUrl}/dashboard`);
  }

  getRevenueTrend(period: string): Observable<RevenueAnalyticsResponse> {
    const params = new HttpParams().set('period', period.toLowerCase());
    return this.http.get<RevenueAnalyticsResponse>(`${this.baseUrl}/analytics/revenue-trend`, { params });
  }

  getReviewTrends(period: string): Observable<ReviewTrendsResponse> {
    const params = new HttpParams().set('period', period.toLowerCase());
    return this.http.get<ReviewTrendsResponse>(`${this.baseUrl}/reviews/trends`, { params });
  }

  getBenchmark(): Observable<BenchmarkResponse> {
    return this.http.get<BenchmarkResponse>(`${this.baseUrl}/benchmark`);
  }

  exportFinancial(options: FinancialExportOptions = {}): Observable<Blob> {
    let params = new HttpParams().set('format', options.format ?? 'csv');
    if (options.fromDate) params = params.set('from_date', options.fromDate);
    if (options.toDate) params = params.set('to_date', options.toDate);
    if (options.txType) params = params.set('tx_type', options.txType);

    return this.http.get(`${this.baseUrl}/export/financial`, {
      params,
      responseType: 'blob'
    });
  }
}
