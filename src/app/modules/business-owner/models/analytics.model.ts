export interface RevenueTrendPoint {
  period: string; // e.g. "2026-07"
  revenue: number;
  orders: number;
}

export interface RevenueAnalyticsResponse {
  total_revenue: number;
  avg_order_value: number;
  orders_count: number;
  overall_trend: string; // 'Rising' | 'Stable' | 'Falling'
  data: RevenueTrendPoint[];
}

export interface ReviewTrendPoint {
  period: string;
  avg_sentiment: number;
  negative_count: number;
  review_count: number;
}

export interface ReviewTrendsResponse {
  avg_sentiment: number;
  total_reviews: number;
  negative_review_pct: number;
  data: ReviewTrendPoint[];
}
