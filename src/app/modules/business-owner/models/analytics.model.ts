export interface RevenueTrendPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface RevenueAnalyticsResponse {
  total_revenue: number;
  avg_order_value: number;
  orders_count: number;
  overall_trend: string; // 'Rising' | 'Stable' | 'Falling'
  trend_data: RevenueTrendPoint[];
}

export interface ReviewTrendPoint {
  date: string;
  avg_sentiment: number;
  negative_reviews: number;
  total_reviews: number;
}

export interface ReviewTrendsResponse {
  avg_sentiment: number;
  total_reviews: number;
  negative_review_pct: number;
  sentiment_trend: ReviewTrendPoint[];
}
