// ─────────────────────────────────────────────────────────────────────────────
// Talentree · Customer Orders — Service
// Signals-based state, mirrors PayoutManagement / Materials Orders pattern
// ─────────────────────────────────────────────────────────────────────────────
import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, map, catchError, throwError, finalize } from 'rxjs';
import {
  CoCreateOrderRequest,
  CoCreateOrderResponse,
  CoOrdersQuery,
  CoPaginatedOrders,
  CoOrderListItem,
  CoOrderDetails,
  CoOrderItem,
  CoOrderTimelineStep,
  CoPaymentIntentResponse,
  CoCancelOrderResponse,
  CoRefundRequestPayload,
  CoRefundRequestResponse,
  CoShippingAddress,
  OrderStatus,
  PaymentStatus,
  OrderStatusCode,
  ORDER_STATUS_STRING_TO_CODE,
} from '../models/co-order.models';
import { environment } from '../../../../core/environment/envirinment';

export type CoPaymentMethodParam = 'card' | 'cash_on_delivery' | 'wallet';

// ── Generic API envelope: { success, data, message, errors, timestamp } ────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors: string[] | null;
  timestamp: string;
}

// ── method query-param codes for POST /api/customer/orders ────────────────
// Confirmed by live test: method=0 → paymentMethod "CreditCard" (card).
// 1 and 2 are UNCONFIRMED guesses — verify against backend (try method=1,
// method=2 in Swagger) and correct these before relying on them.
export const CO_PAYMENT_METHOD_CODE: Record<CoPaymentMethodParam, number> = {
  card: 0,
  cash_on_delivery: 1, // UNCONFIRMED
  wallet: 2,           // UNCONFIRMED
};

// ── Shape exactly as returned by GET /api/customer/orders, BEFORE remapping
// to the CoPaginatedOrders shape the templates expect. Confirmed from the
// real Network response on 2026-06-28 — field names are "data" (the array)
// and "count" (total count), NOT "items" / "totalCount".
interface RawPaginatedOrders {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: RawOrderListItem[];
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  firstItemIndex: number;
  lastItemIndex: number;
}

interface RawOrderListItem {
  id: number;
  createdAt: string;
  totalAmount: number;
  status: string;        // already human-readable, e.g. "Pending", "Cancelled" — NOT a numeric statusCode
  paymentStatus: string;
  paymentMethod: string;
  itemCount: number;
}

// ── Shape exactly as returned by POST /api/customer/orders.
// Confirmed from real Network response on 2026-06-29.
interface RawCreateOrderItem {
  productId: number;
  productName: string;
  productImageUrl: string;
  sellerName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

interface RawCreateOrderStatusHistoryEntry {
  status: string;
  notes: string;
  changedAt: string;
}

interface RawCreateOrderResponse {
  id: number;
  createdAt: string;
  delivery: CoShippingAddress;
  subtotalAmount: number;
  shippingAmount: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  trackingNumber: string | null;
  estimatedDeliveryDate: string | null;
  actualDeliveryDate: string | null;
  items: RawCreateOrderItem[];
  statusHistory: RawCreateOrderStatusHistoryEntry[];
}

// ── Shape exactly as returned by GET /api/customer/orders/{id}.
// Confirmed from real Network response on 2026-07-01 — the field is
// "delivery" (NOT "shippingAddress"), and there is no orderNumber,
// statusCode, timeline, canCancel, canRequestRefund, taxAmount, or
// discount on the wire at all. All of those are derived below.
interface RawOrderDetailsItem {
  productId: number;
  productName: string;
  productImageUrl: string;
  sellerName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

interface RawOrderDetailsStatusHistoryEntry {
  status: string;
  notes: string;
  changedAt: string;
}

interface RawOrderDetails {
  id: number;
  createdAt: string;
  delivery: CoShippingAddress;
  subtotalAmount: number;
  shippingAmount: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  trackingNumber: string | null;
  estimatedDeliveryDate: string | null;
  actualDeliveryDate: string | null;
  items: RawOrderDetailsItem[];
  statusHistory: RawOrderDetailsStatusHistoryEntry[];
}

const BASE = `${environment.baseUrl}/api/customer/orders`;

@Injectable({ providedIn: 'root' })
export class CustomerOrdersService {
  private readonly http = inject(HttpClient);

  // ── Orders list state ───────────────────────────────────────────────────
  private readonly _orders = signal<CoPaginatedOrders | null>(null);
  private readonly _ordersLoading = signal(false);
  private readonly _ordersError = signal<string | null>(null);

  readonly orders = this._orders.asReadonly();
  readonly ordersLoading = this._ordersLoading.asReadonly();
  readonly ordersError = this._ordersError.asReadonly();

  readonly hasOrders = computed(() => (this._orders()?.data.length ?? 0) > 0);

  // ── Order details state ─────────────────────────────────────────────────
  private readonly _orderDetails = signal<CoOrderDetails | null>(null);
  private readonly _detailsLoading = signal(false);
  private readonly _detailsError = signal<string | null>(null);

  readonly orderDetails = this._orderDetails.asReadonly();
  readonly detailsLoading = this._detailsLoading.asReadonly();
  readonly detailsError = this._detailsError.asReadonly();

  // ── Checkout state ──────────────────────────────────────────────────────
  private readonly _checkoutSubmitting = signal(false);
  private readonly _checkoutError = signal<string | null>(null);

  readonly checkoutSubmitting = this._checkoutSubmitting.asReadonly();
  readonly checkoutError = this._checkoutError.asReadonly();

  // ── Cancel state ────────────────────────────────────────────────────────
  private readonly _cancelLoading = signal(false);
  private readonly _cancelError = signal<string | null>(null);

  readonly cancelLoading = this._cancelLoading.asReadonly();
  readonly cancelError = this._cancelError.asReadonly();

  // ── Refund state ────────────────────────────────────────────────────────
  private readonly _refundSubmitting = signal(false);
  private readonly _refundError = signal<string | null>(null);

  readonly refundSubmitting = this._refundSubmitting.asReadonly();
  readonly refundError = this._refundError.asReadonly();

  // ── Invoice state ───────────────────────────────────────────────────────
  private readonly _invoiceDownloading = signal(false);

  readonly invoiceDownloading = this._invoiceDownloading.asReadonly();

  // ═══════════════════════════════════════════════════════════════════════
  // CREATE ORDER  →  POST /api/customer/orders?method=
  // ═══════════════════════════════════════════════════════════════════════
  createOrder(
    payload: CoCreateOrderRequest,
    method: CoPaymentMethodParam
  ): Observable<CoCreateOrderResponse> {
    this._checkoutSubmitting.set(true);
    this._checkoutError.set(null);

    const params = new HttpParams().set('method', CO_PAYMENT_METHOD_CODE[method]);

    return this.http.post<ApiResponse<RawCreateOrderResponse>>(BASE, payload, { params }).pipe(
      map((res) => normalizeCreateOrderResponse(res.data)),
      finalize(() => this._checkoutSubmitting.set(false)),
      catchError((err) => {
        this._checkoutError.set(extractErrorMessage(err, 'Could not place your order. Please try again.'));
        return throwError(() => err);
      })
    );
  }

  resetCheckoutError(): void {
    this._checkoutError.set(null);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ORDERS HISTORY  →  GET /api/customer/orders
  // ═══════════════════════════════════════════════════════════════════════
  loadOrders(query: CoOrdersQuery): void {
    this._ordersLoading.set(true);
    this._ordersError.set(null);

    let params = new HttpParams()
      .set('PageIndex', query.pageIndex)
      .set('PageSize', query.pageSize);

    if (query.status && query.status !== 'all') {
      params = params.set('Status', query.status);
    }
    if (query.search?.trim()) {
      params = params.set('Search', query.search.trim());
    }

    this.http.get<ApiResponse<RawPaginatedOrders>>(BASE, { params }).pipe(
      tap((res) => this._orders.set(normalizePaginatedOrders(res.data))),
      catchError((err) => {
        this._ordersError.set(extractErrorMessage(err, 'Could not load your orders right now.'));
        this._orders.set(null);
        return throwError(() => err);
      }),
      finalize(() => this._ordersLoading.set(false))
    ).subscribe();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ORDER DETAILS  →  GET /api/customer/orders/{id}
  // ═══════════════════════════════════════════════════════════════════════
  loadOrderDetails(orderId: string): void {
    this._detailsLoading.set(true);
    this._detailsError.set(null);
    this._orderDetails.set(null);

    this.http.get<ApiResponse<RawOrderDetails>>(`${BASE}/${orderId}`).pipe(
      tap((res) => this._orderDetails.set(normalizeOrderDetails(res.data))),
      catchError((err) => {
        this._detailsError.set(extractErrorMessage(err, 'Could not load this order.'));
        return throwError(() => err);
      }),
      finalize(() => this._detailsLoading.set(false))
    ).subscribe();
  }

  refreshOrderDetails(orderId: string): void {
    this.loadOrderDetails(orderId);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // PAYMENT INTENT  →  POST /api/customer/orders/{id}/payment-intent
  // ═══════════════════════════════════════════════════════════════════════
  createOrderPaymentIntent(orderId: string): Observable<CoPaymentIntentResponse> {
    return this.http
      .post<ApiResponse<CoPaymentIntentResponse>>(`${BASE}/${orderId}/payment-intent`, {})
      .pipe(map((res) => res.data));
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CANCEL ORDER  →  POST /api/customer/orders/{id}/cancel
  // Confirmed from real Network response on 2026-07-01: `data` is null.
  // The backend does NOT return orderId/status/cancelledAt — those are
  // synthesized locally on success rather than read off the response body.
  // ═══════════════════════════════════════════════════════════════════════
  cancelOrder(orderId: string): Observable<CoCancelOrderResponse> {
    this._cancelLoading.set(true);
    this._cancelError.set(null);

    return this.http.post<ApiResponse<null>>(`${BASE}/${orderId}/cancel`, {}).pipe(
      map((): CoCancelOrderResponse => ({
        orderId,
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
      })),
      tap(() => {
        // Full refetch of details (not a partial patch) — cancelling changes
        // more than just `status`/`canCancel`; the `timeline` array also
        // gains a new step, which a partial optimistic patch can't express
        // correctly. Only refetch if these are the details currently loaded.
        const current = this._orderDetails();
        if (current && current.id === orderId) {
          this.loadOrderDetails(orderId);
        }
        // Optimistic update of list signal if present — list view has no
        // timeline to keep in sync, so a partial patch is safe here.
        const list = this._orders();
        if (list) {
          this._orders.set({
            ...list,
            data: list.data.map((o: CoOrderListItem) =>
              o.id === orderId ? { ...o, status: 'cancelled' as OrderStatus, statusCode: OrderStatusCode.Cancelled } : o
            ),
          });
        }
      }),
      catchError((err) => {
        this._cancelError.set(extractErrorMessage(err, 'Could not cancel this order.'));
        return throwError(() => err);
      }),
      finalize(() => this._cancelLoading.set(false))
    );
  }

  resetCancelError(): void {
    this._cancelError.set(null);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // INVOICE  →  GET /api/customer/orders/{id}/invoice
  // ═══════════════════════════════════════════════════════════════════════
  downloadInvoice(orderId: string, orderNumber: string): Observable<Blob> {
    this._invoiceDownloading.set(true);

    return this.http.get(`${BASE}/${orderId}/invoice`, { responseType: 'blob' }).pipe(
      tap((blob) => triggerBlobDownload(blob, `invoice-${orderNumber}.pdf`)),
      finalize(() => this._invoiceDownloading.set(false))
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // REFUND REQUEST  →  POST /api/customer/orders/{id}/items/{itemId}/refund-request
  // ═══════════════════════════════════════════════════════════════════════
  requestRefund(
    orderId: string,
    itemId: string,
    payload: CoRefundRequestPayload
  ): Observable<CoRefundRequestResponse> {
    this._refundSubmitting.set(true);
    this._refundError.set(null);

    return this.http
      .post<CoRefundRequestResponse>(
        `${BASE}/${orderId}/items/${itemId}/refund-request`,
        payload
      )
      .pipe(
        tap(() => {
          const current = this._orderDetails();
          if (current && current.id === orderId) {
            this._orderDetails.set({
              ...current,
              items: current.items.map((it) =>
                it.id === itemId ? { ...it, refundStatus: 'requested' } : it
              ),
            });
          }
        }),
        catchError((err) => {
          this._refundError.set(extractErrorMessage(err, 'Could not submit your refund request.'));
          return throwError(() => err);
        }),
        finalize(() => this._refundSubmitting.set(false))
      );
  }

  resetRefundError(): void {
    this._refundError.set(null);
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

// Remaps the RAW API shape ({ data: [...], count, ... }, with raw string
// status and numeric id) into CoPaginatedOrders as defined in
// co-order.models.ts ({ data: CoOrderListItem[], count, ... }).
function normalizePaginatedOrders(res: RawPaginatedOrders): CoPaginatedOrders {
  return {
    pageIndex: res.pageIndex,
    pageSize: res.pageSize,
    count: res.count,
    totalPages: res.totalPages,
    hasPrevious: res.hasPrevious,
    hasNext: res.hasNext,
    firstItemIndex: res.firstItemIndex,
    lastItemIndex: res.lastItemIndex,
    data: res.data.map((item): CoOrderListItem => ({
      id: String(item.id),
      // API has no dedicated order-number field — derive a display value.
      // Replace with a real field if/when the backend adds one.
      orderNumber: `#${item.id}`,
      status: normalizeOrderStatusString(item.status),
      statusCode: ORDER_STATUS_STRING_TO_CODE[normalizeOrderStatusString(item.status)],
      paymentStatus: normalizePaymentStatusString(item.paymentStatus),
      itemCount: item.itemCount,
      totalAmount: item.totalAmount,
      // API doesn't return currency on this endpoint — confirm with backend;
      // hardcoded for now so the template has something to render.
      currency: 'EGP',
      createdAt: item.createdAt,
      // API doesn't return a thumbnail on the list endpoint — template
      // already falls back to a placeholder icon when this is null.
      thumbnailUrl: null,
    })),
  };
}

// API returns PascalCase-ish strings like "Pending", "Cancelled" —
// lowercase them to match the OrderStatus union type.
function normalizeOrderStatusString(raw: string): OrderStatus {
  const lowered = raw.toLowerCase() as OrderStatus;
  return ORDER_STATUS_STRING_TO_CODE[lowered] !== undefined ? lowered : 'pending';
}

function normalizePaymentStatusString(raw: string): PaymentStatus {
  const lowered = raw.toLowerCase();
  const valid: PaymentStatus[] = ['unpaid', 'pending', 'paid', 'failed', 'refunded'];
  return (valid as string[]).includes(lowered) ? (lowered as PaymentStatus) : 'unpaid';
}

// Human-readable labels for timeline steps, keyed by the same lowercase
// OrderStatus union used everywhere else in this file.
const TIMELINE_LABELS: Record<OrderStatus, string> = {
  pending: 'Order Placed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

// Remaps the RAW order-details shape (numeric id, `delivery` field instead
// of `shippingAddress`, no orderNumber/statusCode/timeline/canCancel/
// canRequestRefund/taxAmount/discount on the wire) into CoOrderDetails as
// defined in co-order.models.ts. Confirmed from the real Network response
// on 2026-07-01 for GET /api/customer/orders/{id}.
function normalizeOrderDetails(res: RawOrderDetails): CoOrderDetails {
  const status = normalizeOrderStatusString(res.status);
  const paymentStatus = normalizePaymentStatusString(res.paymentStatus);

  // Timeline is built from statusHistory — the API gives no separate
  // "timeline" field. Every entry that has already happened is marked
  // completed; the most recent entry is also flagged as current.
  const timeline: CoOrderTimelineStep[] = res.statusHistory.map((entry, index) => {
    const entryStatus = normalizeOrderStatusString(entry.status);
    const isLast = index === res.statusHistory.length - 1;
    return {
      status: entryStatus,
      label: TIMELINE_LABELS[entryStatus] ?? entry.status,
      timestamp: entry.changedAt,
      completed: true,
      current: isLast,
    };
  });

  // ASSUMPTION — backend has no canCancel/canRequestRefund flags on this
  // endpoint. canCancel is derived: only orders still in pending/processing
  // can be cancelled. canRequestRefund is conservatively false until the
  // backend exposes a real rule; confirm with backend before relying on it.
  const canCancel = status === 'pending' || status === 'processing';
  const canRequestRefund = false;

  return {
    id: String(res.id),
    orderNumber: `#${res.id}`,
    status,
    statusCode: ORDER_STATUS_STRING_TO_CODE[status],
    paymentStatus,
    createdAt: res.createdAt,
    estimatedDeliveryDate: res.estimatedDeliveryDate,
    shippingAddress: res.delivery,
    items: res.items.map((it): CoOrderItem => ({
      // API has no per-item order-line id — productId is used as a stand-in.
      // Replace with a real item id if/when the backend adds one.
      id: String(it.productId),
      productId: String(it.productId),
      productName: it.productName,
      imageUrl: it.productImageUrl,
      sellerName: it.sellerName,
      unitPrice: it.unitPrice,
      quantity: it.quantity,
      lineTotal: it.lineTotal,
      // API doesn't return currency per item — hardcoded to match the
      // order-level currency assumption used elsewhere in this file.
      currency: 'EGP',
      // API doesn't return refund status per item on this endpoint.
      refundStatus: 'none',
    })),
    subtotal: res.subtotalAmount,
    shippingFee: res.shippingAmount,
    // API doesn't return tax or discount on this endpoint — 0 until the
    // backend adds these fields.
    taxAmount: 0,
    discount: 0,
    totalAmount: res.totalAmount,
    currency: 'EGP',
    timeline,
    canCancel,
    canRequestRefund,
  };
}

// Remaps the RAW createOrder response (numeric id/productId, raw PascalCase
// status strings) into CoCreateOrderResponse as defined in co-order.models.ts.
function normalizeCreateOrderResponse(res: RawCreateOrderResponse): CoCreateOrderResponse {
  return {
    id: String(res.id),
    createdAt: res.createdAt,
    delivery: res.delivery,
    subtotalAmount: res.subtotalAmount,
    shippingAmount: res.shippingAmount,
    totalAmount: res.totalAmount,
    status: normalizeOrderStatusString(res.status),
    paymentStatus: normalizePaymentStatusString(res.paymentStatus),
    paymentMethod: res.paymentMethod,
    trackingNumber: res.trackingNumber,
    estimatedDeliveryDate: res.estimatedDeliveryDate,
    actualDeliveryDate: res.actualDeliveryDate,
    items: res.items.map((it) => ({
      productId: String(it.productId),
      productName: it.productName,
      productImageUrl: it.productImageUrl,
      sellerName: it.sellerName,
      unitPrice: it.unitPrice,
      quantity: it.quantity,
      lineTotal: it.lineTotal,
    })),
    statusHistory: res.statusHistory.map((h) => ({
      status: normalizeOrderStatusString(h.status),
      notes: h.notes,
      changedAt: h.changedAt,
    })),
  };
}

function extractErrorMessage(err: unknown, fallback: string): string {
  const e = err as { error?: { message?: string }; message?: string };
  return e?.error?.message ?? e?.message ?? fallback;
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}