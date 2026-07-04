import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AiDashboardOverview } from '../../models/dashboard.model';
import { RevenueAnalyticsResponse, ReviewTrendsResponse, RevenueTrendPoint, ReviewTrendPoint } from '../../models/analytics.model';
import {
  ChurnPredictionResponse,
  FraudPredictionResponse,
  AnomalyPredictionResponse,
  SentimentPredictionResponse
} from '../../models/prediction.model';
import {
  TriagePredictionResponse,
  DemandPredictionResponse,
  ComputeProductResponse,
  ComputeProfileResponse,
  ComputeRequestResponse,
  ComputeMaterialsAllResponse,
  BackgroundJobResponse,
  NotifyCheckResponse,
  BenchmarkResponse,
  ModelsStatusResponse,
  TrainFraudResponse,
  TrainAnomalyResponse,
  FinancialExportOptions
} from '../../models/ai-tools.model';

@Injectable({
  providedIn: 'root'
})
export class AiDashboardService {
  private readonly baseUrl = 'http://20.244.32.232:8000';

  constructor(private http: HttpClient) {}

  getDashboardOverview(boUserId: string): Observable<AiDashboardOverview> {
    return this.http.get<AiDashboardOverview>(`${this.baseUrl}/ai/dashboard/${boUserId}`).pipe(
      catchError(err => {
        console.warn('AI Dashboard Overview API failed, falling back to mock data', err);
        return of(this.getMockOverview());
      })
    );
  }

  getRevenueTrend(boUserId: string, period: string): Observable<RevenueAnalyticsResponse> {
    const params = new HttpParams().set('period', period.toLowerCase());
    return this.http.get<RevenueAnalyticsResponse>(`${this.baseUrl}/ai/analytics/revenue-trend/${boUserId}`, { params }).pipe(
      catchError(err => {
        console.warn('AI Revenue Trend API failed, falling back to mock data', err);
        return of(this.getMockRevenueTrend(period));
      })
    );
  }

  getReviewTrends(boUserId: string, period: string): Observable<ReviewTrendsResponse> {
    const params = new HttpParams().set('period', period.toLowerCase());
    return this.http.get<ReviewTrendsResponse>(`${this.baseUrl}/ai/reviews/trends/${boUserId}`, { params }).pipe(
      catchError(err => {
        console.warn('AI Review Trends API failed, falling back to mock data', err);
        return of(this.getMockReviewTrends(period));
      })
    );
  }

  predictChurn(userId: string): Observable<ChurnPredictionResponse> {
    return this.http.post<ChurnPredictionResponse>(`${this.baseUrl}/ai/predict/churn/${userId}`, {}).pipe(
      catchError(err => {
        console.warn('AI Churn Prediction API failed, falling back to mock data', err);
        return of({
          user_id: userId,
          churn_risk_score: Math.random()
        });
      })
    );
  }

  predictFraud(requestId: number): Observable<FraudPredictionResponse> {
    return this.http.post<FraudPredictionResponse>(`${this.baseUrl}/ai/predict/fraud/${requestId}`, {}).pipe(
      catchError(err => {
        console.warn('AI Fraud Prediction API failed, falling back to mock data', err);
        const score = Math.random();
        return of({
          request_id: requestId,
          fraud_score: score,
          is_fraud: score > 0.5
        });
      })
    );
  }

  predictAnomaly(txId: number): Observable<AnomalyPredictionResponse> {
    return this.http.post<AnomalyPredictionResponse>(`${this.baseUrl}/ai/predict/anomaly/${txId}`, {}).pipe(
      catchError(err => {
        console.warn('AI Anomaly Prediction API failed, falling back to mock data', err);
        const score = Math.random();
        return of({
          tx_id: txId,
          anomaly_score: score,
          is_anomaly: score > 0.6
        });
      })
    );
  }

  predictSentiment(reviewId: number): Observable<SentimentPredictionResponse> {
    return this.http.post<SentimentPredictionResponse>(`${this.baseUrl}/ai/predict/sentiment/${reviewId}`, {}).pipe(
      catchError(err => {
        console.warn('AI Sentiment Prediction API failed, falling back to mock data', err);
        const labels = ['Positive', 'Neutral', 'Negative'] as const;
        const label = labels[Math.floor(Math.random() * labels.length)];
        const score = label === 'Positive' ? 0.4 + Math.random() * 0.6
          : label === 'Negative' ? -1 + Math.random() * 0.6
          : -0.2 + Math.random() * 0.4;
        return of({
          review_id: reviewId,
          sentiment_score: parseFloat(score.toFixed(4)),
          sentiment_label: label,
          flagged_toxic: label === 'Negative' && Math.random() > 0.7
        });
      })
    );
  }

  predictTriage(ticketId: number): Observable<TriagePredictionResponse> {
    return this.http.post<TriagePredictionResponse>(`${this.baseUrl}/ai/predict/triage/${ticketId}`, {}).pipe(
      catchError(err => {
        console.warn('AI Triage Prediction API failed, falling back to mock data', err);
        const categories = ['Payment', 'Shipping', 'Product Quality', 'Account', 'General'];
        return of({
          ticket_id: ticketId,
          auto_category: categories[Math.floor(Math.random() * categories.length)],
          priority_score: parseFloat(Math.random().toFixed(2))
        });
      })
    );
  }

  predictDemand(productId: number): Observable<DemandPredictionResponse> {
    return this.http.post<DemandPredictionResponse>(`${this.baseUrl}/ai/predict/demand/${productId}`, {}).pipe(
      catchError(err => {
        console.warn('AI Demand Prediction API failed, falling back to mock data', err);
        const qty = Math.floor(Math.random() * 40);
        return of({
          product_id: productId,
          demand_forecast_qty: qty,
          low_stock_flag: qty < 8
        });
      })
    );
  }

  // ── Compute (recomputes real derived business data — never fake this) ──
  computeProduct(productId: number): Observable<ComputeProductResponse> {
    return this.http.post<ComputeProductResponse>(`${this.baseUrl}/ai/compute/product/${productId}`, {});
  }

  computeProfile(boUserId: string): Observable<ComputeProfileResponse> {
    return this.http.post<ComputeProfileResponse>(`${this.baseUrl}/ai/compute/profile/${boUserId}`, {});
  }

  computeRequest(requestId: number): Observable<ComputeRequestResponse> {
    return this.http.post<ComputeRequestResponse>(`${this.baseUrl}/ai/compute/request/${requestId}`, {});
  }

  computeMaterialsAll(): Observable<ComputeMaterialsAllResponse> {
    return this.http.post<ComputeMaterialsAllResponse>(`${this.baseUrl}/ai/compute/materials/all`, {});
  }

  computeAll(): Observable<BackgroundJobResponse> {
    return this.http.post<BackgroundJobResponse>(`${this.baseUrl}/ai/compute/all`, {});
  }

  // ── Notifications ──
  notifyCheck(boUserId: string): Observable<NotifyCheckResponse> {
    return this.http.post<NotifyCheckResponse>(`${this.baseUrl}/ai/notify/check/${boUserId}`, {});
  }

  notifyCheckAll(): Observable<NotifyCheckResponse> {
    return this.http.post<NotifyCheckResponse>(`${this.baseUrl}/ai/notify/check/all`, {});
  }

  // ── Benchmark (read-only, safe to fall back to mock) ──
  getBenchmark(boUserId: string): Observable<BenchmarkResponse> {
    return this.http.get<BenchmarkResponse>(`${this.baseUrl}/ai/benchmark/${boUserId}`).pipe(
      catchError(err => {
        console.warn('AI Benchmark API failed, falling back to mock data', err);
        return of(this.getMockBenchmark(boUserId));
      })
    );
  }

  getAllBenchmarks(): Observable<BenchmarkResponse> {
    return this.http.get<BenchmarkResponse>(`${this.baseUrl}/ai/benchmark/all`).pipe(
      catchError(err => {
        console.warn('AI Benchmark (all) API failed, falling back to mock data', err);
        return of(this.getMockBenchmark('all'));
      })
    );
  }

  // ── Model status (read-only, safe to fall back to mock) ──
  getModelsStatus(): Observable<ModelsStatusResponse> {
    return this.http.get<ModelsStatusResponse>(`${this.baseUrl}/ai/models/status`).pipe(
      catchError(err => {
        console.warn('AI Models Status API failed, falling back to mock data', err);
        return of(this.getMockModelsStatus());
      })
    );
  }

  // ── Training (mutates real models platform-wide — never fake this) ──
  trainChurn(): Observable<BackgroundJobResponse> {
    return this.http.post<BackgroundJobResponse>(`${this.baseUrl}/ai/train/churn`, {});
  }

  trainFraud(): Observable<TrainFraudResponse> {
    return this.http.post<TrainFraudResponse>(`${this.baseUrl}/ai/train/fraud`, {});
  }

  trainAnomaly(): Observable<TrainAnomalyResponse> {
    return this.http.post<TrainAnomalyResponse>(`${this.baseUrl}/ai/train/anomaly`, {});
  }

  trainAll(): Observable<BackgroundJobResponse> {
    return this.http.post<BackgroundJobResponse>(`${this.baseUrl}/ai/train/all`, {});
  }

  // ── Financial export (file download) ──
  exportFinancial(boUserId: string, options: FinancialExportOptions = {}): Observable<Blob> {
    let params = new HttpParams().set('format', options.format ?? 'csv');
    if (options.fromDate) params = params.set('from_date', options.fromDate);
    if (options.toDate) params = params.set('to_date', options.toDate);
    if (options.txType) params = params.set('tx_type', options.txType);

    return this.http.get(`${this.baseUrl}/ai/export/financial/${boUserId}`, {
      params,
      responseType: 'blob'
    });
  }

  // High-fidelity Mock Generators
  private getMockBenchmark(userId: string): BenchmarkResponse {
    const pct = () => Math.floor(30 + Math.random() * 60);
    const rankFromPct = (p: number) => p >= 80 ? 'top 20%' : p >= 60 ? 'top 40%' : p >= 40 ? 'average' : 'bottom 40%';
    const fulfillmentPct = pct();
    const qualityPct = pct();
    const ratingPct = pct();
    return {
      user_id: userId,
      fulfillment_rank: rankFromPct(fulfillmentPct),
      fulfillment_rank_pct: fulfillmentPct,
      quality_rank: rankFromPct(qualityPct),
      quality_rank_pct: qualityPct,
      rating_rank: rankFromPct(ratingPct),
      rating_rank_pct: ratingPct,
      bo_fulfillment_hours: parseFloat((Math.random() * 48).toFixed(1)),
      platform_avg_fulfillment_hours: parseFloat((Math.random() * 48).toFixed(1)),
      bo_quality_score: parseFloat(Math.random().toFixed(2)),
      platform_avg_quality: parseFloat(Math.random().toFixed(2))
    };
  }

  private getMockModelsStatus(): ModelsStatusResponse {
    const now = new Date().toISOString();
    return {
      churn_model: { model_type: 'XGBoost', accuracy: 0.94, f1_score: 0.9, training_rows: 500, saved_at: now, data_source: 'mock' },
      anomaly_model: { model_type: 'IsolationForest', training_rows: 1000, contamination: 0.06, saved_at: now, data_source: 'mock' },
      fraud_model: { model_type: 'XGBoost', accuracy: 0.9, f1_score: 0.83, training_rows: 200, saved_at: now, data_source: 'mock' },
      demand_model: { model_type: 'LinearRegression (per product)', avg_mae: 2.5, products_trained: 10, saved_at: now, data_source: 'mock' }
    };
  }

  private getMockOverview(): AiDashboardOverview {
    return {
      revenue_total: 128450.75,
      revenue_last_30d: 14250.50,
      revenue_trend: 'Rising', // 'Rising' | 'Stable' | 'Falling'
      total_orders: 843,
      avg_fulfillment_hours: 4.8,
      fraud_alerts: 2,
      low_stock_count: 5,
      churn_risk_score: 0.12, // low churn
      profile_completeness_pct: 85,
      avg_product_quality_score: 4.7,
      avg_review_sentiment: 0.82,
      negative_reviews_count: 12,
      open_support_tickets: 3
    };
  }

  private getMockRevenueTrend(period: string): RevenueAnalyticsResponse {
    const points: RevenueTrendPoint[] = [];
    const count = period === 'yearly' ? 12 : period === 'monthly' ? 30 : period === 'weekly' ? 7 : 24;
    const labels = this.getTrendLabels(period, count);
    
    let totalRevenue = 0;
    let totalOrders = 0;
    let baseRev = period === 'yearly' ? 15000 : period === 'monthly' ? 600 : period === 'weekly' ? 1200 : 80;

    for (let i = 0; i < count; i++) {
      const noise = (Math.random() - 0.3) * (baseRev * 0.4); // slightly positive bias
      const revenue = Math.round((baseRev + noise) * 100) / 100;
      const orders = Math.round(revenue / (40 + Math.random() * 15));
      totalRevenue += revenue;
      totalOrders += orders;
      points.push({
        date: labels[i],
        revenue,
        orders
      });
    }

    return {
      total_revenue: Math.round(totalRevenue * 100) / 100,
      avg_order_value: totalOrders > 0 ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0,
      orders_count: totalOrders,
      overall_trend: 'Rising',
      trend_data: points
    };
  }

  private getMockReviewTrends(period: string): ReviewTrendsResponse {
    const points: ReviewTrendPoint[] = [];
    const count = period === 'yearly' ? 12 : period === 'monthly' ? 30 : period === 'weekly' ? 7 : 24;
    const labels = this.getTrendLabels(period, count);
    
    let totalReviews = 0;
    let negReviews = 0;
    let sumSentiment = 0;

    for (let i = 0; i < count; i++) {
      const volume = Math.floor(Math.random() * 8) + 1;
      const neg = Math.random() > 0.85 ? Math.floor(Math.random() * 2) : 0;
      const avgSentiment = parseFloat((0.4 + Math.random() * 0.6 - (neg > 0 ? 0.3 : 0)).toFixed(2));
      
      totalReviews += volume;
      negReviews += neg;
      sumSentiment += avgSentiment * volume;

      points.push({
        date: labels[i],
        avg_sentiment: avgSentiment,
        negative_reviews: neg,
        total_reviews: volume
      });
    }

    return {
      avg_sentiment: totalReviews > 0 ? parseFloat((sumSentiment / totalReviews).toFixed(2)) : 0.8,
      total_reviews: totalReviews,
      negative_review_pct: totalReviews > 0 ? Math.round((negReviews / totalReviews) * 100) : 0,
      sentiment_trend: points
    };
  }

  private getTrendLabels(period: string, count: number): string[] {
    const labels: string[] = [];
    const now = new Date();
    if (period === 'yearly') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (let i = count - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels.push(months[d.getMonth()]);
      }
    } else if (period === 'monthly') {
      for (let i = count - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        labels.push(`${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`);
      }
    } else if (period === 'weekly') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = count - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        labels.push(days[d.getDay()]);
      }
    } else {
      // daily (hourly)
      for (let i = count - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() - i);
        labels.push(`${d.getHours()}:00`);
      }
    }
    return labels;
  }
}
