// ─────────────────────────────────────────────────────────────────────────────
// Talentree · Customer Cart — Service
// Signals-based state, mirrors CustomerOrdersService pattern
// ─────────────────────────────────────────────────────────────────────────────
import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, catchError, throwError, finalize } from 'rxjs';
import { environment } from '../../../../core/environment/envirinment';

// ── Models ────────────────────────────────────────────────────────────────────

export interface CartItem {
  productId: number;
  productName: string;
  productImageUrl: string | null;
  sellerName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  stockQuantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  estimatedShipping: number;
  total: number;
}

export interface CheckoutPreview {
  items: CartItem[];
  subtotal: number;
  shippingAmount: number;
  total: number;
  delivery: ShippingAddress;
}

export interface ShippingAddress {
  fullName: string;
  phoneNumber: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// ── Generic API envelope ──────────────────────────────────────────────────────
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors: string[] | null;
  timestamp: string;
}

const BASE = `${environment.baseUrl}/api/customer/cart`;

// ─────────────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class CustomerCartService {
  private readonly http = inject(HttpClient);

  // ── Cart state ────────────────────────────────────────────────────────────
  private readonly _cart = signal<Cart | null>(null);
  private readonly _cartLoading = signal(false);
  private readonly _cartError = signal<string | null>(null);

  readonly cart = this._cart.asReadonly();
  readonly cartLoading = this._cartLoading.asReadonly();
  readonly cartError = this._cartError.asReadonly();

  /** Total number of distinct items in the cart (for badge display) */
  readonly cartItemCount = computed(() => this._cart()?.items.length ?? 0);

  /** Total quantity across all items */
  readonly cartTotalQty = computed(() =>
    this._cart()?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0
  );

  readonly cartTotal = computed(() => this._cart()?.total ?? 0);
  readonly hasItems = computed(() => (this._cart()?.items.length ?? 0) > 0);

  // ── Add-to-cart state (per-product loading) ───────────────────────────────
  private readonly _addingProductId = signal<number | null>(null);
  private readonly _addError = signal<string | null>(null);

  readonly addingProductId = this._addingProductId.asReadonly();
  readonly addError = this._addError.asReadonly();

  // ── Update/remove state ───────────────────────────────────────────────────
  private readonly _updatingProductId = signal<number | null>(null);
  private readonly _removingProductId = signal<number | null>(null);
  private readonly _clearLoading = signal(false);

  readonly updatingProductId = this._updatingProductId.asReadonly();
  readonly removingProductId = this._removingProductId.asReadonly();
  readonly clearLoading = this._clearLoading.asReadonly();

  // ── Checkout preview state ────────────────────────────────────────────────
  private readonly _checkoutPreview = signal<CheckoutPreview | null>(null);
  private readonly _previewLoading = signal(false);
  private readonly _previewError = signal<string | null>(null);

  readonly checkoutPreview = this._checkoutPreview.asReadonly();
  readonly previewLoading = this._previewLoading.asReadonly();
  readonly previewError = this._previewError.asReadonly();

  // ═══════════════════════════════════════════════════════════════════════════
  // GET CART  →  GET /api/customer/cart
  // ═══════════════════════════════════════════════════════════════════════════
  loadCart(): void {
    this._cartLoading.set(true);
    this._cartError.set(null);

    this.http.get<ApiResponse<Cart>>(BASE).pipe(
      tap((res) => this._cart.set(res.data)),
      catchError((err) => {
        this._cartError.set(extractErrorMessage(err, 'Could not load your cart.'));
        return throwError(() => err);
      }),
      finalize(() => this._cartLoading.set(false))
    ).subscribe();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ADD ITEM  →  POST /api/customer/cart/items
  // ═══════════════════════════════════════════════════════════════════════════
  addItem(productId: number, quantity = 1): Observable<Cart> {
    this._addingProductId.set(productId);
    this._addError.set(null);

    const payload: AddToCartRequest = { productId, quantity };

    return this.http.post<ApiResponse<Cart>>(`${BASE}/items`, payload).pipe(
      map((res) => res.data),
      tap((cart) => this._cart.set(cart)),
      catchError((err) => {
        this._addError.set(extractErrorMessage(err, 'Could not add item to cart.'));
        return throwError(() => err);
      }),
      finalize(() => this._addingProductId.set(null))
    );
  }

  resetAddError(): void {
    this._addError.set(null);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE ITEM QUANTITY  →  PUT /api/customer/cart/items/{productId}
  // ═══════════════════════════════════════════════════════════════════════════
  updateItemQuantity(productId: number, quantity: number): Observable<Cart> {
    this._updatingProductId.set(productId);

    const payload: UpdateCartItemRequest = { quantity };

    return this.http
      .put<ApiResponse<Cart>>(`${BASE}/items/${productId}`, payload)
      .pipe(
        map((res) => res.data),
        tap((cart) => this._cart.set(cart)),
        catchError((err) => throwError(() => err)),
        finalize(() => this._updatingProductId.set(null))
      );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // REMOVE ITEM  →  DELETE /api/customer/cart/items/{productId}
  // ═══════════════════════════════════════════════════════════════════════════
  removeItem(productId: number): Observable<Cart> {
    this._removingProductId.set(productId);

    return this.http
      .delete<ApiResponse<Cart>>(`${BASE}/items/${productId}`)
      .pipe(
        map((res) => res.data),
        tap((cart) => this._cart.set(cart)),
        catchError((err) => throwError(() => err)),
        finalize(() => this._removingProductId.set(null))
      );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CLEAR CART  →  DELETE /api/customer/cart
  // ═══════════════════════════════════════════════════════════════════════════
  clearCart(): Observable<void> {
    this._clearLoading.set(true);

    return this.http.delete<ApiResponse<null>>(BASE).pipe(
      map(() => void 0),
      tap(() => this._cart.set({ items: [], subtotal: 0, estimatedShipping: 0, total: 0 })),
      catchError((err) => throwError(() => err)),
      finalize(() => this._clearLoading.set(false))
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CHECKOUT PREVIEW  →  GET /api/customer/cart/checkout-preview
  // ═══════════════════════════════════════════════════════════════════════════
  loadCheckoutPreview(address: ShippingAddress): void {
    this._previewLoading.set(true);
    this._previewError.set(null);

    const params = {
      FullName: address.fullName,
      PhoneNumber: address.phoneNumber,
      Street: address.street,
      City: address.city,
      PostalCode: address.postalCode,
      Country: address.country,
    };

    this.http.get<ApiResponse<CheckoutPreview>>(`${BASE}/checkout-preview`, { params }).pipe(
      tap((res) => this._checkoutPreview.set(res.data)),
      catchError((err) => {
        this._previewError.set(extractErrorMessage(err, 'Could not load checkout preview.'));
        return throwError(() => err);
      }),
      finalize(() => this._previewLoading.set(false))
    ).subscribe();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  /** Returns true if this specific product is currently being added */
  isAdding(productId: number): boolean {
    return this._addingProductId() === productId;
  }

  /** Returns true if this specific product quantity is being updated */
  isUpdating(productId: number): boolean {
    return this._updatingProductId() === productId;
  }

  /** Returns true if this specific product is being removed */
  isRemoving(productId: number): boolean {
    return this._removingProductId() === productId;
  }
}

// ── Utility ───────────────────────────────────────────────────────────────────
function extractErrorMessage(err: unknown, fallback: string): string {
  const e = err as { error?: { message?: string }; message?: string };
  return e?.error?.message ?? e?.message ?? fallback;
}