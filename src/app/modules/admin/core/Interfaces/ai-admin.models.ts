// ai-admin.models.ts
// Interfaces for the AI admin endpoints.
//
// SECTION 1 (dashboard / kpis / health / sellers) is built directly from real
// response bodies that were confirmed against the backend.
//
// SECTION 2 (analytics / forecast / customers / rfm-segments / categories /
// price-anomalies / export) is now ALSO built directly from real confirmed
// response bodies (captured 2026-07-02). Export is still unconfirmed since no
// sample response was provided for it - see note at the bottom of this file.

// =============================================================================
// SECTION 1 — CONFIRMED (dashboard / kpis / health / sellers)
// =============================================================================

// ---------------------------------------------------------------------------
// GET /api/admin/ai/dashboard
// ---------------------------------------------------------------------------

export interface AdminDashboardSummary {
    sellers: SellersSummary;
    customers_total: number;
    products: ProductsSummary;
    b2c_orders: B2COrdersSummary;
    b2b_orders: B2BOrdersSummary;
    current_month_revenue: number;
    pending_actions: PendingActions;
    alerts: DashboardAlerts;
    recent_activity: RecentActivity;
}

export interface SellersSummary {
    total: number;
    active: number;
    pending: number;
    suspended: number;
}

export interface ProductsSummary {
    total: number;
    approved: number;
    pending: number;
}

export interface B2COrdersSummary {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    total: number;
}

export interface B2BOrdersSummary {
    submitted: number;
    under_review: number;
    quoted: number;
    confirmed: number;
    in_production: number;
    completed: number;
    rejected: number;
    cancelled: number;
    total: number;
}

export interface PendingActions {
    sellers_pending_approval: number;
    products_pending_approval: number;
    overdue_complaints: number;
    overdue_tickets: number;
    total: number;
}

export interface LowStockProduct {
    product_id: number;
    name: string;
    stock_qty: number;
    demand_forecast_qty: number;
    seller: string;
    category: string;
}

export interface SellerAwaitingApproval {
    user_id: string;
    business_name: string;
    category: string;
    submitted_at: string;
    deadline: string;
    waiting_days: number;
}

export interface AnomalyTransaction {
    tx_id: number;
    seller_id: string;
    amount: number;
    anomaly_score: number;
    type: string;
    created_at: string;
}

export interface DashboardAlerts {
    low_stock_products: LowStockProduct[];
    sellers_awaiting_approval: SellerAwaitingApproval[];
    // Empty array in every sample seen so far - shape unconfirmed.
    // Update this type once a populated example is available.
    overdue_complaints: unknown[];
    anomaly_transactions: AnomalyTransaction[];
}

export interface NewSeller {
    user_id: string;
    email: string;
    business_name: string;
    category: string;
    registered_at: string;
}

export interface NewProduct {
    product_id: number;
    name: string;
    status: number;
    submitted_at: string;
    category: string;
}

export interface RecentTicket {
    ticket_id: number;
    ticket_number: string;
    subject: string;
    auto_category: string;
    priority_score: number;
    status: number;
    created_at: string;
}

export interface RecentActivity {
    new_sellers: NewSeller[];
    new_products: NewProduct[];
    recent_tickets: RecentTicket[];
}

// ---------------------------------------------------------------------------
// GET /api/admin/ai/kpis
// ---------------------------------------------------------------------------

export interface AdminKpisResponse {
    health_score: number;
    health_label: string;
    kpis: AdminKpis;
}

export interface AdminKpis {
    customer_conversion_rate: number;
    average_order_value: number;
    seller_churn_rate: number;
    product_approval_rate: number;
    customer_satisfaction_rating: number;
    fraud_rate: number;
    transaction_anomaly_rate: number;
    avg_fulfillment_hours: number;
    avg_seller_profile_completeness: number;
}

// ---------------------------------------------------------------------------
// GET /api/admin/ai/health
// ---------------------------------------------------------------------------

export interface AdminHealthResponse {
    health_score: number;
    label: string;
    components: AdminHealthComponents;
}

export interface AdminHealthComponents {
    avg_rating: number;
    conversion_rate_pct: number;
    churn_rate_pct: number;
    fraud_rate_pct: number;
    anomaly_rate_pct: number;
}

// ---------------------------------------------------------------------------
// GET /api/admin/ai/sellers?sort_by=risk
// GET /api/admin/ai/sellers/{sellerId}
// ---------------------------------------------------------------------------

export interface AdminSellerBase {
    seller_id: string;
    email: string;
    is_active: boolean;
    churn_risk_score: number;
    risk_level: string; // seen values: "High Risk", "Healthy" - confirm full enum with backend
    business_name: string;
    category: string;
    approval_status: number; // 1 = Pending, 2 = Approved (inferred)
    profile_completeness: number;
    joined_date: string;
    products_count: number;
    approved_products: number;
    total_revenue: number;
    b2b_orders_total: number;
    b2b_orders_completed: number;
    avg_fulfillment_hours: number;
    avg_customer_rating: number;
    avg_fraud_score: number;
    avg_quality_score: number;
}

export type AdminSellerListItem = AdminSellerBase;

export interface SellerRevenueTrendPoint {
    month: string;
    revenue: number;
}

export interface AdminSellerDetail extends AdminSellerBase {
    revenue_trend: SellerRevenueTrendPoint[];
}

// =============================================================================
// SECTION 2 — CONFIRMED (analytics / forecast / customers / rfm-segments /
// categories / price-anomalies), captured from real sample responses.
// =============================================================================

// ---------------------------------------------------------------------------
// GET /api/admin/ai/analytics
// ---------------------------------------------------------------------------

export interface AdminAnalyticsResponse {
    period: string;
    revenue_trend: AnalyticsRevenuePoint[];
    user_growth: AnalyticsUserGrowthPoint[];
    order_volume: AnalyticsOrderVolumePoint[];
    category_distribution: AnalyticsCategoryDistribution[];
    b2b_distribution: AnalyticsB2bStatusCount[];
    sentiment_breakdown: AnalyticsSentimentBreakdown[];
}

export interface AnalyticsRevenuePoint {
    period: string;
    gross_sales: number;
    refunds: number;
    fees: number;
    net_revenue: number;
}

export interface AnalyticsUserGrowthPoint {
    period: string;
    new_sellers: number;
    new_customers: number;
}

export interface AnalyticsOrderVolumePoint {
    period: string;
    total_orders: number;
    delivered: number;
    cancelled: number;
    total_value: number;
}

export interface AnalyticsCategoryDistribution {
    category: string;
    product_count: number;
    total_purchases: number;
    avg_rating: number;
    avg_price: number;
}

export interface AnalyticsB2bStatusCount {
    status: string;
    count: number;
}

export interface AnalyticsSentimentBreakdown {
    label: string; // seen values: "Negative", "Neutral", "Positive"
    count: number;
    avg_score: number;
}

// ---------------------------------------------------------------------------
// GET /api/admin/ai/forecast
// ---------------------------------------------------------------------------

export interface AdminForecastResponse {
    actuals: ForecastActualPoint[];
    forecast: ForecastPredictedPoint[];
    model_meta: ForecastModelMeta;
}

export interface ForecastActualPoint {
    month: string;
    revenue: number;
}

export interface ForecastPredictedPoint {
    month: string;
    forecasted_revenue: number;
}

export interface ForecastModelMeta {
    method: string; // seen value: "simple_average_fallback"
    trained_at: string | null;
}

// ---------------------------------------------------------------------------
// GET /api/admin/ai/customers
// Returns a single insights object, not a list of individual customers.
// ---------------------------------------------------------------------------

export interface AdminCustomerInsightsResponse {
    high_value_segments: HighValueCustomer[];
    // Empty array in the sample seen so far - assumed to share the same shape
    // as high_value_segments since both are described as "segments" of the
    // same customer list. Confirm with backend once a populated example exists.
    inactive_90d_segments: HighValueCustomer[];
    peak_shopping_hours: PeakShoppingHour[];
    top_wishlisted_products: WishlistedProduct[];
    category_preferences: CustomerCategoryPreference[];
    new_vs_returning_30d: NewVsReturning;
}

export interface HighValueCustomer {
    customer_id: string;
    name: string;
    email: string;
    orders_count: number;
    lifetime_value: number;
    avg_order_value: number;
    first_order_date: string | null;
    last_order_date: string | null;
    days_since_last: number;
}

export interface PeakShoppingHour {
    hour: number;
    orders: number;
}

export interface WishlistedProduct {
    product_id: number;
    name: string;
    wishlist_count: number;
    category: string;
    price: number;
    avg_rating: number;
}

export interface CustomerCategoryPreference {
    category: string;
    items_ordered: number;
}

export interface NewVsReturning {
    new_customers: number;
    returning_customers: number;
}

// ---------------------------------------------------------------------------
// GET /api/admin/ai/rfm-segments
// `distribution` is a dynamic object keyed by segment name -> customer count.
// Seen keys: "At Risk", "Champion", "Lost", "Loyal" - full enum unconfirmed,
// so this is typed as a generic string-keyed record rather than an exact union.
// ---------------------------------------------------------------------------

export interface AdminRfmSegmentsResponse {
    source: string; // seen value: "database"
    distribution: Record<string, number>;
    total: number;
}

// ---------------------------------------------------------------------------
// GET /api/admin/ai/categories
// ---------------------------------------------------------------------------

export interface AdminCategoryPerformance {
    category_id: number;
    category_name: string;
    business_type: string;
    total_products: number;
    approved_products: number;
    pending_products: number;
    approval_rate_pct: number;
    avg_price: number;
    min_price: number;
    max_price: number;
    total_purchases: number;
    total_revenue: number;
    total_views: number;
    avg_rating: number;
    avg_quality_score: number;
    low_stock_count: number;
    seller_count: number;
}

// ---------------------------------------------------------------------------
// GET /api/admin/ai/price-anomalies
// ---------------------------------------------------------------------------

export interface AdminPriceAnomaliesResponse {
    status: string; // seen value: "success"
    total_products_scanned: number;
    anomalies_detected: number;
    anomalies: PriceAnomalyItem[];
}

export interface PriceAnomalyItem {
    product_id: number;
    name: string;
    seller: string; // can be an empty string when the seller is unresolved
    category: string;
    price: number;
    category_avg_price: number;
    anomaly_severity: number; // observed range ~0.001-0.25, not a 0-1 scale
    reason: string;
}

// ---------------------------------------------------------------------------
// GET /api/admin/ai/export/{type}
// TODO: confirm with backend - no sample response was provided for this
// endpoint. Export endpoints likely return a raw file (CSV/XLSX/PDF) rather
// than JSON, so the service method for this uses `responseType: 'blob'`.
// ---------------------------------------------------------------------------

export type AdminExportType = 'sellers' | 'customers' | 'analytics'; // TODO: confirm with backend - full list of exportable types
// =============================================================================
// APPEND THIS BLOCK TO THE END OF ai-admin.models.ts
// =============================================================================

// ---------------------------------------------------------------------------
// GET /api/admin/ai/categories/{categoryId}/trend?period=monthly
// ---------------------------------------------------------------------------

export interface CategoryTrendPoint {
    period: string;
    revenue: number;
}

// ---------------------------------------------------------------------------
// GET /api/admin/ai/category-forecast
//
// Response shape varies:
// - When there isn't enough historical data (< 2 months), the API returns a
//   "skipped" status with a reason instead of forecast data (confirmed via
//   live sample response).
// - TODO: confirm the exact shape of a successful response with the backend
//   team once at least one category has >= 2 months of history. The shape
//   below is modeled by analogy with AdminForecastResponse (same actuals /
//   forecast / model_meta pattern) since no populated sample was available.
//   Update this type once confirmed - do not assume it's correct in prod.
// ---------------------------------------------------------------------------

export interface CategoryForecastSkipped {
    status: 'skipped';
    reason: string;
}

export interface CategoryForecastItem {
    category_id: number;
    category_name: string;
    actuals: ForecastActualPoint[];
    forecast: ForecastPredictedPoint[];
    model_meta: ForecastModelMeta;
}

export interface CategoryForecastSuccess {
    status: 'success';
    categories: CategoryForecastItem[];
}

export type AdminCategoryForecastResponse = CategoryForecastSkipped | CategoryForecastSuccess;
// =============================================================================
// APPEND THIS BLOCK TO THE END OF ai-admin.models.ts
// SECTION 3 — Model management: train / compute / export
// =============================================================================

// ---------------------------------------------------------------------------
// POST /api/admin/ai/train/forecast
//
// Skipped when there isn't enough historical revenue data yet (confirmed via
// live sample response).
// TODO: confirm the success-case shape with the backend team once a BO/
// category has >= 2 months of history - only the skipped response has been
// observed so far. Do not assume TrainForecastSuccess is correct in prod.
// ---------------------------------------------------------------------------

export interface TrainForecastSkipped {
    status: 'skipped';
    reason: string;
    rows: number;
}

export interface TrainForecastSuccess {
    status: 'trained';
    [key: string]: unknown; // TODO: replace with confirmed fields once available
}

export type TrainForecastResponse = TrainForecastSkipped | TrainForecastSuccess;

// ---------------------------------------------------------------------------
// POST /api/admin/ai/train/rfm
// Confirmed via live sample response.
// ---------------------------------------------------------------------------

export interface TrainRfmTrainResult {
    status: string; // seen: "trained"
    n_customers: number;
    k_clusters: number;
    label_map: Record<string, string>;
    trained_at: string;
}

export interface TrainRfmSegmentationResult {
    status: string; // seen: "complete"
    total: number;
    written_to_db: number;
    skipped: number;
    distribution: Record<string, number>;
}

export interface TrainRfmResponse {
    train: TrainRfmTrainResult;
    segmentation: TrainRfmSegmentationResult;
}

// ---------------------------------------------------------------------------
// POST /api/admin/ai/train/all-bo
// POST /api/admin/ai/compute/all-bo
//
// TODO: confirm the exact response shape with the backend - no sample
// response has been captured for either endpoint yet. Modeled generically
// so the UI can still render *something* meaningful (a status string plus
// a raw JSON dump) until confirmed. Replace with a proper interface once
// a real response is available.
// ---------------------------------------------------------------------------

export interface GenericAiActionResponse {
    status?: string;
    [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// GET /api/admin/ai/export/kpis
// GET /api/admin/ai/export/financial/{boUserId}
//
// Both are raw file downloads, not JSON:
// - /export/kpis            -> .xlsx (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)
// - /export/financial/{id}  -> .csv  (text/csv)
// The service methods for these use `observe: 'response'` + `responseType: 'blob'`
// so the filename can be read from the Content-Disposition header.
// No dedicated TS interface is needed for the body since it's binary.
// ---------------------------------------------------------------------------