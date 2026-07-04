export interface AiDashboardOverview {
  revenue_total: number;
  revenue_last_30d: number;
  revenue_trend: string; // 'Rising' | 'Stable' | 'Falling'
  total_orders: number;
  avg_fulfillment_hours: number;
  fraud_alerts: number;
  low_stock_count: number;
  churn_risk_score: number; // 0 to 1
  profile_completeness_pct: number; // 0 to 100
  avg_product_quality_score: number;
  avg_review_sentiment: number; // -1 to 1 or 0 to 1
  negative_reviews_count: number;
  open_support_tickets: number;
}
