// ─────────────────────────────────────────────────────────────────────────────
// Talentree · Customer Orders — Domain Models
// Prefix convention: co- (customer orders)
// ─────────────────────────────────────────────────────────────────────────────

// ── Backend numeric status codes (mirrors products feature pattern) ─────────
export const enum OrderStatusCode {
  Pending = 1,
  Processing = 2,
  Shipped = 3,
  Delivered = 4,
  Cancelled = 5,
  Refunded = 6,
}

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

// Bidirectional mapping constants — same convention as products feature
export const ORDER_STATUS_CODE_TO_STRING: Record<OrderStatusCode, OrderStatus> = {
  [OrderStatusCode.Pending]: 'pending',
  [OrderStatusCode.Processing]: 'processing',
  [OrderStatusCode.Shipped]: 'shipped',
  [OrderStatusCode.Delivered]: 'delivered',
  [OrderStatusCode.Cancelled]: 'cancelled',
  [OrderStatusCode.Refunded]: 'refunded',
};

export const ORDER_STATUS_STRING_TO_CODE: Record<OrderStatus, OrderStatusCode> = {
  pending: OrderStatusCode.Pending,
  processing: OrderStatusCode.Processing,
  shipped: OrderStatusCode.Shipped,
  delivered: OrderStatusCode.Delivered,
  cancelled: OrderStatusCode.Cancelled,
  refunded: OrderStatusCode.Refunded,
};

export function mapOrderStatus(code: OrderStatusCode | number): OrderStatus {
  return ORDER_STATUS_CODE_TO_STRING[code as OrderStatusCode] ?? 'pending';
}

export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded';

// ── Shipping / Checkout ───────────────────────────────────────────────────────
export interface CoShippingAddress {
  fullName: string;
  phoneNumber: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export type CoPaymentMethod = 'card' | 'cash_on_delivery' | 'wallet';

export interface CoCreateOrderRequest extends CoShippingAddress {}

export interface CoCreateOrderItem {
  productId: string;          // API returns number; coerced with String() in the service normalizer
  productName: string;
  productImageUrl: string | null;
  sellerName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface CoCreateOrderStatusHistoryEntry {
  status: OrderStatus;
  notes: string;
  changedAt: string;
}

export interface CoCreateOrderResponse {
  id: string;                 // API returns number; coerced with String() in the service normalizer
  createdAt: string;
  delivery: CoShippingAddress;
  subtotalAmount: number;
  shippingAmount: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;      // raw string from backend, e.g. "CreditCard"
  trackingNumber: string | null;
  estimatedDeliveryDate: string | null;
  actualDeliveryDate: string | null;
  items: CoCreateOrderItem[];
  statusHistory: CoCreateOrderStatusHistoryEntry[];
}

// ── Cart summary used at checkout (read-only projection, not the cart itself) ─
export interface CoCheckoutLineItem {
  productId: string;
  productName: string;
  imageUrl: string | null;
  sellerName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface CoCheckoutSummary {
  items: CoCheckoutLineItem[];
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  discount: number;
  total: number;
  currency: string;
}

// ── Orders list ───────────────────────────────────────────────────────────────
export interface CoOrderListItem {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  statusCode: OrderStatusCode;
  paymentStatus: PaymentStatus;
  itemCount: number;
  totalAmount: number;
  currency: string;
  createdAt: string;
  thumbnailUrl: string | null;
}

export interface CoOrdersQuery {
  status?: OrderStatus | 'all';
  search?: string;
  pageIndex: number;
  pageSize: number;
}

export interface CoPaginatedOrders {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: CoOrderListItem[];   // <-- was probably named "items" before
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  firstItemIndex: number;
  lastItemIndex: number;
}

// ── Order details ─────────────────────────────────────────────────────────────
export interface CoOrderTimelineStep {
  status: OrderStatus;
  label: string;
  timestamp: string | null;
  completed: boolean;
  current: boolean;
}

export interface CoOrderItem {
  id: string;
  productId: string;
  productName: string;
  imageUrl: string | null;
  sellerName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  currency: string;
  refundStatus: 'none' | 'requested' | 'approved' | 'rejected';
}

export interface CoOrderDetails {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  statusCode: OrderStatusCode;
  paymentStatus: PaymentStatus;
  createdAt: string;
  estimatedDeliveryDate: string | null;
  shippingAddress: CoShippingAddress;
  items: CoOrderItem[];
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
  currency: string;
  timeline: CoOrderTimelineStep[];
  canCancel: boolean;
  canRequestRefund: boolean;
}

// ── Payment ───────────────────────────────────────────────────────────────────
export interface CoPaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

// ── Cancel ────────────────────────────────────────────────────────────────────
export interface CoCancelOrderResponse {
  orderId: string;
  status: OrderStatus;
  cancelledAt: string;
}

// ── Refund ────────────────────────────────────────────────────────────────────
export interface CoRefundRequestPayload {
  reason: string;
}

export interface CoRefundRequestResponse {
  refundRequestId: string;
  itemId: string;
  status: 'requested';
  submittedAt: string;
}

// ── Generic async UI state used across components ────────────────────────────
export interface CoAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
export interface CoCreateOrderItem {
  productId: string;          // API returns number; coerced with String() in normalizer
  productName: string;
  productImageUrl: string | null;
  sellerName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface CoCreateOrderStatusHistoryEntry {
  status: OrderStatus;
  notes: string;
  changedAt: string;
}

export interface CoCreateOrderResponse {
  id: string;                 // API returns number; coerced with String()
  createdAt: string;
  delivery: CoShippingAddress;
  subtotalAmount: number;
  shippingAmount: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;      // e.g. "CreditCard" — raw string from backend, not yet mapped to CoPaymentMethod
  trackingNumber: string | null;
  estimatedDeliveryDate: string | null;
  actualDeliveryDate: string | null;
  items: CoCreateOrderItem[];
  statusHistory: CoCreateOrderStatusHistoryEntry[];
}

export function coInitialAsyncState<T>(): CoAsyncState<T> {
  return { data: null, loading: false, error: null };
}
