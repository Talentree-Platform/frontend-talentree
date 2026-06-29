import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  Observable, Subject, BehaviorSubject,
  debounceTime, distinctUntilChanged, switchMap,
  catchError, tap, of, finalize
} from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  HomepageResponse, PaginatedResponse, Product,
  ProductQueryParams, AutocompleteItem, FilterState, SortOption
} from '../models/customer,models';
import { environment } from '../../../../core/environment/envirinment';
import { ProductDetailsResponse, ProductDetailsData } from '../models/product-details';

const API_BASE = `${environment.baseUrl}/api/customer`;
const DEBOUNCE_MS = 350;
const DEFAULT_PAGE_SIZE = 12;

@Injectable({ providedIn: 'root' })
export class CustomerMarketplaceService {
  private readonly http = inject(HttpClient);

  // ── Homepage ────────────────────────────────────────────────────────────────
  readonly homepageLoading  = signal(false);
  readonly homepageError    = signal<string | null>(null);
  readonly homepageData     = signal<HomepageResponse['data'] | null>(null);

  loadHomepage(): void {
    this.homepageLoading.set(true);
    this.homepageError.set(null);

    this.http.get<HomepageResponse>(`${API_BASE}/homepage`).pipe(
      tap(res  => this.homepageData.set(res.data)),
      catchError(err => {
        this.homepageError.set(err?.error?.message ?? 'Failed to load homepage data.');
        return of(null);
      }),
      finalize(() => this.homepageLoading.set(false))
    ).subscribe();
  }

  // ── Product Catalog ─────────────────────────────────────────────────────────
  readonly productsLoading  = signal(false);
  readonly productsError    = signal<string | null>(null);
  readonly productsData     = signal<PaginatedResponse<Product> | null>(null);

  // Centralised filter state – single source of truth
  readonly filters = signal<FilterState>({
    search:     '',
    categoryId: null,
    brandId:    null,
    minPrice:   null,
    maxPrice:   null,
    sortBy:     'newest',
  });

  readonly currentPage = signal(1);

  /** Derived: total products count */
  readonly totalCount = computed(() => this.productsData()?.count ?? 0);
  readonly totalPages = computed(() => this.productsData()?.totalPages ?? 1);
  readonly hasNext    = computed(() => this.productsData()?.hasNext ?? false);
  readonly hasPrev    = computed(() => this.productsData()?.hasPrevious ?? false);

  loadProducts(params?: Partial<ProductQueryParams>): void {
    this.productsLoading.set(true);
    this.productsError.set(null);

    const f = this.filters();
    const query: ProductQueryParams = {
      search:     f.search     || undefined,
      categoryId: f.categoryId || undefined,
      brandId:    f.brandId    || undefined,
      minPrice:   f.minPrice   ?? undefined,
      maxPrice:   f.maxPrice   ?? undefined,
      sortBy:     f.sortBy,
      pageIndex:  this.currentPage(),
      pageSize:   DEFAULT_PAGE_SIZE,
      ...params,
    };

    this.http
      .get<PaginatedResponse<Product>>(`${API_BASE}/products`, {
        params: this.buildHttpParams(query),
      })
      .pipe(
        tap(res  => this.productsData.set(res)),
        catchError(err => {
          this.productsError.set(err?.error?.message ?? 'Failed to load products.');
          return of(null);
        }),
        finalize(() => this.productsLoading.set(false))
      )
      .subscribe();
  }

  /** Update a subset of filters and reset to page 1 */
  updateFilters(patch: Partial<FilterState>): void {
    this.filters.update(f => ({ ...f, ...patch }));
    this.currentPage.set(1);
    this.loadProducts();
  }

  setPage(page: number): void {
    this.currentPage.set(page);
    this.loadProducts();
  }

  resetFilters(): void {
    this.filters.set({
      search: '', categoryId: null, brandId: null,
      minPrice: null, maxPrice: null, sortBy: 'newest',
    });
    this.currentPage.set(1);
    this.loadProducts();
  }

  // ── Product Details ─────────────────────────────────────────────────────────
  readonly productDetailsLoading = signal(false);
  readonly productDetailsError   = signal<string | null>(null);
  readonly productDetails        = signal<ProductDetailsData | null>(null);

  readonly isOutOfStock = computed(() => {
    const details = this.productDetails();
    return !!details && details.stockQuantity <= 0;
  });

  /**
   * Loads a single product's details by id.
   * The API wraps the product in an envelope ({ success, data, message, ... }),
   * same pattern as loadHomepage() — we unwrap res.data into the signal.
   * Related/recommended products come embedded as data.similarProducts,
   * so no second HTTP call is needed.
   */
  loadProductDetails(id: string | number): void {
    this.productDetailsLoading.set(true);
    this.productDetailsError.set(null);

    this.http
      .get<ProductDetailsResponse>(`${API_BASE}/products/${id}`)
      .pipe(
        tap(res => this.productDetails.set(res.data)),
        catchError(err => {
          this.productDetailsError.set(err?.error?.message ?? 'Failed to load product details.');
          this.productDetails.set(null);
          return of(null);
        }),
        finalize(() => this.productDetailsLoading.set(false))
      )
      .subscribe();
  }

  /** Call on ngOnDestroy of the details page to avoid stale data on next visit. */
  resetProductDetailsState(): void {
    this.productDetails.set(null);
    this.productDetailsError.set(null);
  }

  // ── Autocomplete ────────────────────────────────────────────────────────────
  private readonly _autocompleteQuery$ = new Subject<string>();
  readonly autocompleteLoading  = signal(false);
  readonly autocompleteResults  = signal<AutocompleteItem[]>([]);
  readonly autocompleteVisible  = signal(false);

  /** Call once from the search component's ngOnInit */
  initAutocomplete(): void {
    this._autocompleteQuery$.pipe(
      debounceTime(DEBOUNCE_MS),
      distinctUntilChanged(),
      tap(q => {
        if (!q || q.length < 2) {
          this.autocompleteResults.set([]);
          this.autocompleteVisible.set(false);
          this.autocompleteLoading.set(false);
          return;
        }
        this.autocompleteLoading.set(true);
        this.autocompleteVisible.set(true);
      }),
      switchMap(q =>
        q.length < 2
          ? of([])
          : this.http
              .get<AutocompleteItem[]>(`${API_BASE}/products/autocomplete`, {
                params: { q },
              })
              .pipe(catchError(() => of([])))
      ),
      tap(results => {
        this.autocompleteResults.set(results);
        this.autocompleteLoading.set(false);
      })
    ).subscribe();
  }

  pushAutocompleteQuery(q: string): void {
    this._autocompleteQuery$.next(q);
  }

  closeAutocomplete(): void {
    this.autocompleteVisible.set(false);
  }

  // ── Cart (local state, swap with real CartService if exists) ────────────────
  readonly cartItems = signal<Map<string, number>>(new Map());

  readonly cartCount = computed(() => {
    let total = 0;
    this.cartItems().forEach(qty => (total += qty));
    return total;
  });

  addToCart(productId: string, qty: number = 1): void {
    this.cartItems.update(map => {
      const next = new Map(map);
      next.set(productId, (next.get(productId) ?? 0) + qty);
      return next;
    });
  }

  updateCartQty(productId: string, qty: number): void {
    this.cartItems.update(map => {
      const next = new Map(map);
      if (qty <= 0) next.delete(productId);
      else next.set(productId, qty);
      return next;
    });
  }

  getCartQty(productId: string): number {
    return this.cartItems().get(productId) ?? 0;
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────
  private buildHttpParams<T extends object>(query: T): HttpParams {
    let params = new HttpParams();
    (Object.entries(query) as [string, unknown][]).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params = params.set(key, String(val));
      }
    });
    return params;
  }
}