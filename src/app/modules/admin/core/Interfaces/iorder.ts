// ── Status Types (string unions matching API response) ────────────────────────

export type OrderStatus =
    | 'Pending'
    | 'Confirmed'
    | 'Processing'
    | 'Shipped'
    | 'Delivered'
    | 'Cancelled'
    | 'Refunded';

export type PaymentStatus =
    | 'Pending'
    | 'Paid'
    | 'Failed'
    | 'Unpaid'
    | 'Refunded';

// ── Order List Item (from GET /api/AdminOrders) ───────────────────────────────

export interface OrderListItem {
    id: number;
    orderNumber?: string | null;
    customerName?: string | null;
    customerEmail?: string | null;
    sellerNames?: string | null;
    totalAmount: number;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    createdAt: string;
    updatedAt?: string | null;
    itemCount?: number | null;
}

// ── Order Detail (from GET /api/AdminOrders/{id}) ────────────────────────────

export interface OrderProduct {
    productId?: number | null;
    productName?: string | null;
    sku?: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    imageUrl?: string | null;
}

export interface OrderNote {
    id?: number | null;
    note: string;
    createdBy?: string | null;
    createdAt: string;
    isAdmin?: boolean | null;
}

export interface OrderStatusHistory {
    status: OrderStatus;
    changedAt: string;
    changedBy?: string | null;
    reason?: string | null;
    trackingNumber?: string | null;
}

export interface OrderDetail {
    id: number;
    orderNumber?: string | null;

    // Customer
    customerId?: number | null;
    customerName?: string | null;
    customerEmail?: string | null;
    customerPhone?: string | null;

    // Business Owner
    businessOwnerId?: number | null;
    businessOwnerName?: string | null;
    businessOwnerEmail?: string | null;

    // Financials
    subtotal?: number | null;
    shippingCost?: number | null;
    taxAmount?: number | null;
    discountAmount?: number | null;
    totalAmount: number;

    // Status
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentMethod?: string | null;

    // Shipping
    shippingAddress?: string | null;
    shippingCity?: string | null;
    shippingCountry?: string | null;
    trackingNumber?: string | null;
    estimatedDeliveryDate?: string | null;
    deliveredAt?: string | null;

    // Dates
    orderDate?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;

    // Related
    products?: OrderProduct[] | null;
    notes?: OrderNote[] | null;
    statusHistory?: OrderStatusHistory[] | null;
}

// ── Order Stats (from GET /api/AdminOrders/stats) ────────────────────────────

export interface OrderStats {
    totalOrders?: number | null;
    pendingOrders?: number | null;
    confirmedOrders?: number | null;
    processingOrders?: number | null;
    shippedOrders?: number | null;
    deliveredOrders?: number | null;
    cancelledOrders?: number | null;
    refundedOrders?: number | null;
    totalRevenue?: number | null;
    monthlyRevenue?: number | null;
    monthlyGrowthPercentage?: number | null;
    averageOrderValue?: number | null;
    [key: string]: unknown;
}

// ── DTOs ──────────────────────────────────────────────────────────────────────

// Backend uses integer enum for CustomerOrderStatus:
// 0=Pending, 1=Confirmed, 2=Processing, 3=Shipped, 4=Delivered, 5=Cancelled, 6=Refunded
export const ORDER_STATUS_VALUES: Record<OrderStatus, number> = {
    'Pending': 0,
    'Confirmed': 1,
    'Processing': 2,
    'Shipped': 3,
    'Delivered': 4,
    'Cancelled': 5,
    'Refunded': 6,
};

export interface UpdateOrderStatusDto {
    newStatus: number;       // Must be integer (0-6) matching CustomerOrderStatus enum
    reason: string;          // Required by backend (minLength: 1)
    trackingNumber?: string | null;
    estimatedDeliveryDate?: string | null;
}

// ── Filter Params ─────────────────────────────────────────────────────────────

export interface OrderFilterParams {
    search?: string;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortDesc?: boolean;
    pageIndex?: number;
    pageSize?: number;
}

// ── Label Helpers ─────────────────────────────────────────────────────────────

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
    'Pending': 'Pending',
    'Confirmed': 'Confirmed',
    'Processing': 'Processing',
    'Shipped': 'Shipped',
    'Delivered': 'Delivered',
    'Cancelled': 'Cancelled',
    'Refunded': 'Refunded',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
    'Pending': 'Pending',
    'Paid': 'Paid',
    'Failed': 'Failed',
    'Unpaid': 'Unpaid',
    'Refunded': 'Refunded',
};