// Types for the AI microservice's operational/admin endpoints
// (compute, notify, benchmark, model status, train, export).
// Base URL: consumed via AiDashboardService.

export interface TriagePredictionResponse {
  ticket_id: number;
  auto_category: string;
  priority_score: number;
}

export interface DemandPredictionResponse {
  product_id: number;
  demand_forecast_qty: number;
  low_stock_flag: boolean;
}

export interface ComputeProductResponse {
  product_id?: number;
  error?: string;
  [key: string]: unknown;
}

export interface ComputeProfileResponse {
  user_id: string;
  profile_completeness: number;
}

export interface ComputeRequestResponse {
  fulfillment: {
    request_id: number;
    fulfillment_hours: number;
  };
  fraud: {
    request_id: number;
    fraud_score: number;
    is_fraud: boolean;
  };
}

export interface ComputeMaterialResult {
  material_id: number;
  error?: string;
  [key: string]: unknown;
}

export interface ComputeMaterialsAllResponse {
  count: number;
  results: ComputeMaterialResult[];
}

export interface BackgroundJobResponse {
  status: string;
  message: string;
}

export interface NotifyCheckResponse {
  user_id: string;
  notifications_fired: number;
  types: string[];
}

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

export interface ModelStatusEntry {
  model_type: string;
  accuracy?: number;
  f1_score?: number;
  training_rows?: number;
  real_rows?: number;
  augmented_total?: number;
  features?: string[];
  saved_at?: string;
  data_source?: string;
  contamination?: number;
  avg_mae?: number;
  products_trained?: number;
  filename?: string;
}

export interface ModelsStatusResponse {
  churn_model: ModelStatusEntry;
  anomaly_model: ModelStatusEntry;
  fraud_model: ModelStatusEntry;
  demand_model: ModelStatusEntry;
}

export interface TrainFraudResponse {
  status: string;
  rows: number;
  accuracy: number;
  f1: number;
}

export interface TrainAnomalyResponse {
  status: string;
  rows: number;
  contamination: number;
}

export type FinancialExportFormat = 'csv' | 'json';

export interface FinancialExportOptions {
  format?: FinancialExportFormat;
  fromDate?: string;
  toDate?: string;
  txType?: string;
}
