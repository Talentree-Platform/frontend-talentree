// Types for the AI microservice's business-owner-facing endpoints
// (dashboard, revenue trend, review trends, benchmark, financial export),
// proxied through the Azure API's BusinessOwnerAiProxy controller.
// Base URL: consumed via AiDashboardService.

export interface BenchmarkResponse {
  user_id: string;
  fulfillment_rank: string;
  fulfillment_rank_pct: number;
  quality_rank: string;
  quality_rank_pct: number;
  rating_rank: string;
  rating_rank_pct: number;
  bo_fulfillment_hours: number;
  platform_avg_fulfillment_hours: number;
  bo_quality_score: number;
  platform_avg_quality: number;
}

export type FinancialExportFormat = 'csv' | 'json';

export interface FinancialExportOptions {
  format?: FinancialExportFormat;
  fromDate?: string;
  toDate?: string;
  txType?: string;
}
