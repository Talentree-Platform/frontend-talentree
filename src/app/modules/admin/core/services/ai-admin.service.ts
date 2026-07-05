// ai-admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../core/environment/envirinment'; // adjust relative path as needed
import {
  AdminDashboardSummary,
  AdminKpisResponse,
  AdminHealthResponse,
  AdminSellerListItem,
  AdminSellerDetail,
  AdminAnalyticsResponse,
  AdminForecastResponse,
  AdminCustomerInsightsResponse,
  AdminRfmSegmentsResponse,
  AdminCategoryPerformance,
  AdminPriceAnomaliesResponse,
  AdminExportType,
  CategoryTrendPoint,
  AdminCategoryForecastResponse,
  TrainForecastResponse,
  TrainRfmResponse,
  GenericAiActionResponse
} from '../Interfaces/ai-admin.models';

@Injectable({
  providedIn: 'root'
})
export class AiAdminService {
  private readonly baseUrl = `${environment.baseUrl}/api/admin/ai`;

  constructor(private http: HttpClient) { }

  // ---------------------------------------------------------------------
  // CONFIRMED endpoints
  // ---------------------------------------------------------------------

  getDashboard(): Observable<AdminDashboardSummary> {
    return this.http.get<AdminDashboardSummary>(`${this.baseUrl}/dashboard`);
  }

  getKpis(): Observable<AdminKpisResponse> {
    return this.http.get<AdminKpisResponse>(`${this.baseUrl}/kpis`);
  }

  getHealth(): Observable<AdminHealthResponse> {
    return this.http.get<AdminHealthResponse>(`${this.baseUrl}/health`);
  }

  getSellers(sortBy: 'risk' | string = 'risk'): Observable<AdminSellerListItem[]> {
    return this.http.get<AdminSellerListItem[]>(`${this.baseUrl}/sellers`, {
      params: { sort_by: sortBy }
    });
  }

  getSellerDetail(sellerId: string): Observable<AdminSellerDetail> {
    return this.http.get<AdminSellerDetail>(`${this.baseUrl}/sellers/${sellerId}`);
  }

  getAnalytics(): Observable<AdminAnalyticsResponse> {
    return this.http.get<AdminAnalyticsResponse>(`${this.baseUrl}/analytics`);
  }

  getForecast(): Observable<AdminForecastResponse> {
    return this.http.get<AdminForecastResponse>(`${this.baseUrl}/forecast`);
  }

  getCustomers(): Observable<AdminCustomerInsightsResponse> {
    return this.http.get<AdminCustomerInsightsResponse>(`${this.baseUrl}/customers`);
  }

  getRfmSegments(): Observable<AdminRfmSegmentsResponse> {
    return this.http.get<AdminRfmSegmentsResponse>(`${this.baseUrl}/rfm-segments`);
  }

  getCategories(): Observable<AdminCategoryPerformance[]> {
    return this.http.get<AdminCategoryPerformance[]>(`${this.baseUrl}/categories`);
  }

  getPriceAnomalies(): Observable<AdminPriceAnomaliesResponse> {
    return this.http.get<AdminPriceAnomaliesResponse>(`${this.baseUrl}/price-anomalies`);
  }

  /**
   * Revenue trend for a single category over time.
   * GET /api/admin/ai/categories/{categoryId}/trend?period=monthly
   */
  getCategoryTrend(categoryId: number, period: 'weekly' | 'monthly' = 'monthly'): Observable<CategoryTrendPoint[]> {
    return this.http.get<CategoryTrendPoint[]>(`${this.baseUrl}/categories/${categoryId}/trend`, {
      params: { period }
    });
  }

  /**
   * Forward-looking revenue forecast broken down by category.
   * GET /api/admin/ai/category-forecast
   * Returns a "skipped" status when there isn't enough historical data yet.
   */
  getCategoryForecast(): Observable<AdminCategoryForecastResponse> {
    return this.http.get<AdminCategoryForecastResponse>(`${this.baseUrl}/category-forecast`);
  }

  /**
   * Downloads an export file as a raw blob.
   * TODO: confirm with backend - endpoint path, query params, and whether
   * the response is a direct file stream (assumed here) or a JSON envelope.
   * No sample response was available for this endpoint.
   */
  exportData(type: AdminExportType): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/export/${type}`, {
      responseType: 'blob'
    });
  }
  // =============================================================================
  // APPEND THESE IMPORTS to the top import block of ai-admin.service.ts:
  //
  //   import { HttpClient, HttpResponse } from '@angular/common/http';
  //   import {
  //     ...existing imports...
  //     TrainForecastResponse,
  //     TrainRfmResponse,
  //     GenericAiActionResponse
  //   } from '../Interfaces/ai-admin.models';
  //
  // APPEND THESE METHODS inside the AiAdminService class, e.g. right before
  // the closing brace of the class:
  // =============================================================================

  // ---------------------------------------------------------------------
  // Model management: train / compute
  // ---------------------------------------------------------------------

  /**
   * Retrains the revenue forecasting model.
   * POST /api/admin/ai/train/forecast
   * Returns a "skipped" status when there isn't enough historical data yet.
   */
  trainForecast(): Observable<TrainForecastResponse> {
    return this.http.post<TrainForecastResponse>(`${this.baseUrl}/train/forecast`, {});
  }

  /**
   * Retrains the RFM (Recency/Frequency/Monetary) customer segmentation model.
   * POST /api/admin/ai/train/rfm
   */
  trainRfm(): Observable<TrainRfmResponse> {
    return this.http.post<TrainRfmResponse>(`${this.baseUrl}/train/rfm`, {});
  }

  /**
   * Retrains all per-business-owner models.
   * POST /api/admin/ai/train/all-bo
   * TODO: response shape not yet confirmed with backend - typed generically.
   */
  trainAllBo(): Observable<GenericAiActionResponse> {
    return this.http.post<GenericAiActionResponse>(`${this.baseUrl}/train/all-bo`, {});
  }

  /**
   * Recomputes all derived metrics for every business owner.
   * POST /api/admin/ai/compute/all-bo
   * TODO: response shape not yet confirmed with backend - typed generically.
   */
  computeAllBo(): Observable<GenericAiActionResponse> {
    return this.http.post<GenericAiActionResponse>(`${this.baseUrl}/compute/all-bo`, {});
  }

  // ---------------------------------------------------------------------
  // Model management: exports (raw file downloads, not JSON)
  // ---------------------------------------------------------------------

  /**
   * Downloads the platform-wide admin KPI report as an .xlsx file.
   * GET /api/admin/ai/export/kpis
   * `observe: 'response'` is required so the caller can read the filename
   * off the Content-Disposition header.
   */
  exportKpis(): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.baseUrl}/export/kpis`, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  /**
   * Downloads a single business owner's financial report as a .csv file.
   * GET /api/admin/ai/export/financial/{boUserId}
   */
  exportFinancial(boUserId: string): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.baseUrl}/export/financial/${boUserId}`, {
      observe: 'response',
      responseType: 'blob'
    });
  }
}
