// ─────────────────────────────────────────────────────────────────────────────
// Talentree · Customer Wishlist — Service
// Signals-based state, mirrors CustomerCartService pattern
// ─────────────────────────────────────────────────────────────────────────────
import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, catchError, throwError, finalize } from 'rxjs';
import { environment } from '../../../../core/environment/envirinment';

// ── Models ────────────────────────────────────────────────────────────────────

export interface WishlistItem {
  productId: number;
  productName: string;
  productImageUrl: string | null;
  productPrice: number;
  productStockQuantity: number;
  productBrandName: string;
  addedAt: string;
}

export interface Wishlist {
  items: WishlistItem[];
}

// ── Cart models (returned by move-to-cart) ────────────────────────────────────

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

// ── Generic API envelope ──────────────────────────────────────────────────────
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors: string[] | null;
  timestamp: string;
}

const BASE = `${environment.baseUrl}/api/customer/wishlist`;

// ─────────────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class CustomerWishlistService {
  private readonly http = inject(HttpClient);

  // ── Wishlist state ────────────────────────────────────────────────────────
  private readonly _wishlist = signal<Wishlist | null>(null);
  private readonly _wishlistLoading = signal(false);
  private readonly _wishlistError = signal<string | null>(null);

  readonly wishlist = this._wishlist.asReadonly();
  readonly wishlistLoading = this._wishlistLoading.asReadonly();
  readonly wishlistError = this._wishlistError.asReadonly();

  /** Total number of items in the wishlist (for badge display) */
  readonly wishlistItemCount = computed(() => this._wishlist()?.items.length ?? 0);
  readonly hasItems = computed(() => (this._wishlist()?.items.length ?? 0) > 0);

  // ── Per-product action states ─────────────────────────────────────────────
  private readonly _addingProductId = signal<number | null>(null);
  private readonly _removingProductId = signal<number | null>(null);
  private readonly _moveToCartLoading = signal(false);
  private readonly _moveToCartError = signal<string | null>(null);

  readonly addingProductId = this._addingProductId.asReadonly();
  readonly removingProductId = this._removingProductId.asReadonly();
  readonly moveToCartLoading = this._moveToCartLoading.asReadonly();
  readonly moveToCartError = this._moveToCartError.asReadonly();

  // ── Product status cache ──────────────────────────────────────────────────
  private readonly _statusCache = signal<Map<number, boolean>>(new Map());

  // ═══════════════════════════════════════════════════════════════════════════
  // GET WISHLIST  →  GET /api/customer/wishlist
  // ═══════════════════════════════════════════════════════════════════════════
  loadWishlist(): void {
    this._wishlistLoading.set(true);
    this._wishlistError.set(null);

    this.http.get<ApiResponse<Wishlist>>(BASE).pipe(
      tap((res) => this._wishlist.set(res.data)),
      catchError((err) => {
        this._wishlistError.set(extractErrorMessage(err, 'Could not load your wishlist.'));
        return throwError(() => err);
      }),
      finalize(() => this._wishlistLoading.set(false))
    ).subscribe();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ADD TO WISHLIST  →  POST /api/customer/wishlist/{productId}
  // ═══════════════════════════════════════════════════════════════════════════
  addItem(productId: number): Observable<Wishlist> {
    this._addingProductId.set(productId);

    return this.http.post<ApiResponse<Wishlist>>(`${BASE}/${productId}`, null).pipe(
      map((res) => res.data),
      tap((wishlist) => {
        this._wishlist.set(wishlist);
        this._updateStatusCache(productId, true);
      }),
      catchError((err) => throwError(() => err)),
      finalize(() => this._addingProductId.set(null))
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // REMOVE FROM WISHLIST  →  DELETE /api/customer/wishlist/{productId}
  // ═══════════════════════════════════════════════════════════════════════════
  removeItem(productId: number): Observable<Wishlist> {
    this._removingProductId.set(productId);

    return this.http.delete<ApiResponse<Wishlist>>(`${BASE}/${productId}`).pipe(
      map((res) => res.data),
      tap((wishlist) => {
        this._wishlist.set(wishlist);
        this._updateStatusCache(productId, false);
      }),
      catchError((err) => throwError(() => err)),
      finalize(() => this._removingProductId.set(null))
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MOVE ALL TO CART  →  POST /api/customer/wishlist/move-to-cart
  // ═══════════════════════════════════════════════════════════════════════════
  moveAllToCart(): Observable<Cart> {
    this._moveToCartLoading.set(true);
    this._moveToCartError.set(null);

    return this.http.post<ApiResponse<Cart>>(`${BASE}/move-to-cart`, null).pipe(
      map((res) => res.data),
      tap(() => {
        // Wishlist is now empty after moving all items to cart
        this._wishlist.set({ items: [] });
        this._statusCache.set(new Map());
      }),
      catchError((err) => {
        this._moveToCartError.set(extractErrorMessage(err, 'Could not move items to cart.'));
        return throwError(() => err);
      }),
      finalize(() => this._moveToCartLoading.set(false))
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CHECK WISHLIST STATUS  →  GET /api/customer/wishlist/{productId}/status
  // ═══════════════════════════════════════════════════════════════════════════
  checkStatus(productId: number): Observable<boolean> {
    return this.http.get<ApiResponse<boolean>>(`${BASE}/${productId}/status`).pipe(
      map((res) => res.data),
      tap((inWishlist) => this._updateStatusCache(productId, inWishlist)),
      catchError((err) => throwError(() => err))
    );
  }

  /** Toggle: adds if not in wishlist, removes if already in */
  toggle(productId: number): Observable<Wishlist> {
    const inWishlist = this.isInWishlist(productId);
    return inWishlist ? this.removeItem(productId) : this.addItem(productId);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  /** Returns true if a product is currently in the wishlist (from cache or loaded list) */
  isInWishlist(productId: number): boolean {
    // Check cache first
    const cached = this._statusCache().get(productId);
    if (cached !== undefined) return cached;

    // Fall back to loaded wishlist items
    return this._wishlist()?.items.some((i) => i.productId === productId) ?? false;
  }

  /** Returns true if this product is currently being added */
  isAdding(productId: number): boolean {
    return this._addingProductId() === productId;
  }

  /** Returns true if this product is currently being removed */
  isRemoving(productId: number): boolean {
    return this._removingProductId() === productId;
  }

  resetMoveToCartError(): void {
    this._moveToCartError.set(null);
  }

  private _updateStatusCache(productId: number, value: boolean): void {
    this._statusCache.update((map) => {
      const next = new Map(map);
      next.set(productId, value);
      return next;
    });
  }
}

// ── Utility ───────────────────────────────────────────────────────────────────
function extractErrorMessage(err: unknown, fallback: string): string {
  const e = err as { error?: { message?: string }; message?: string };
  return e?.error?.message ?? e?.message ?? fallback;
}