// ─────────────────────────────────────────────────────────────────────────────
// Talentree – CustomerMarketplaceService  (EXTENDED + BRANDS)
// ─────────────────────────────────────────────────────────────────────────────
// Drop this file in place of the existing service.
// All original functionality (homepage, products, product details, autocomplete,
// cart, categories, category products) is preserved.
// NEW: Brands list, Brand details, Brand products — appended at the bottom.
// ─────────────────────────────────────────────────────────────────────────────

import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  Subject,
  debounceTime, distinctUntilChanged, switchMap,
  catchError, tap, of, finalize
} from 'rxjs';
import {
  HomepageData, RawHomepageResponse, PaginatedResponse, Product,
  ProductQueryParams, AutocompleteItem, FilterState, SortOption,
  Category,
  RawCategoryResponse,
  RawCategoryProductsResponse,
  mapRawHomepageData,
  mapRawCategoryToCategory,
  mapCategoryProductsResponse,
  // ── NEW: Brand types/mappers ───────────────────────────────────────────────
  BrandSummary,
  BrandDetails,
  RawBrandsResponse,
  RawBrandDetailsResponse,
  RawBrandProductsResponse,
  mapBrandsResponse,
  mapRawBrandDetailsToBrandDetails,
  mapBrandProductsResponse,
  // ── NEW: Review types ──────────────────────────────────────────────────────
  ProductReview,
  ReviewDistribution,
  RawProductReviewsResponse,
  RawReviewDistributionResponse,
  RawCreateReviewResponse,
  RawHelpfulResponse,
  // ── NEW: Recommendation types/mapper ───────────────────────────────────────
  CustomerRecommendationResponse,
  mapRecommendationsToProducts,
} from '../../Core/interfaces/customer';
import { environment } from '../../../../core/environment/envirinment';
import { ProductDetailsResponse, ProductDetailsData } from '../models/product-details';

const API_BASE    = `${environment.baseUrl}/api/customer`;
const DEBOUNCE_MS = 350;
const DEFAULT_PAGE_SIZE = 12;

@Injectable({ providedIn: 'root' })
export class CustomerMarketplaceService {

  private readonly http = inject(HttpClient);

  // ── Homepage ────────────────────────────────────────────────────────────────
  readonly homepageLoading = signal(false);
  readonly homepageError   = signal<string | null>(null);
  readonly homepageData    = signal<HomepageData | null>(null);

  loadHomepage(): void {
    this.homepageLoading.set(true);
    this.homepageError.set(null);

    this.http.get<RawHomepageResponse>(`${API_BASE}/homepage`).pipe(
      tap(res => this.homepageData.set(mapRawHomepageData(res.data))),
      catchError(err => {
        this.homepageError.set(err?.error?.message ?? 'Failed to load homepage data.');
        return of(null);
      }),
      finalize(() => this.homepageLoading.set(false))
    ).subscribe();
  }

  // ── Product Catalog ─────────────────────────────────────────────────────────
  readonly productsLoading = signal(false);
  readonly productsError   = signal<string | null>(null);
  readonly productsData    = signal<PaginatedResponse<Product> | null>(null);

  readonly filters = signal<FilterState>({
    search:     '',
    categoryId: null,
    brandId:    null,
    minPrice:   null,
    maxPrice:   null,
    sortBy:     'newest',
  });

  readonly currentPage = signal(1);

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
      .get<RawCategoryProductsResponse>(`${API_BASE}/products`, {
        params: this.buildHttpParams(query),
      })
      .pipe(
        tap(res => this.productsData.set(mapCategoryProductsResponse(res.data))),
        catchError(err => {
          this.productsError.set(err?.error?.message ?? 'Failed to load products.');
          return of(null);
        }),
        finalize(() => this.productsLoading.set(false))
      )
      .subscribe();
  }

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
    const d = this.productDetails();
    return !!d && d.stockQuantity <= 0;
  });

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

  resetProductDetailsState(): void {
    this.productDetails.set(null);
    this.productDetailsError.set(null);
  }

  // ── Autocomplete ────────────────────────────────────────────────────────────
  private readonly _autocompleteQuery$ = new Subject<string>();
  readonly autocompleteLoading = signal(false);
  readonly autocompleteResults = signal<AutocompleteItem[]>([]);
  readonly autocompleteVisible = signal(false);

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
          ? of({ success: true, data: [] as AutocompleteItem[] })
          : this.http
              .get<{ success: boolean; data: AutocompleteItem[] }>(`${API_BASE}/products/autocomplete`, { params: { q } })
              .pipe(catchError(() => of({ success: false, data: [] as AutocompleteItem[] })))
      ),
      tap(res => {
        this.autocompleteResults.set(res?.data ?? []);
        this.autocompleteLoading.set(false);
      })
    ).subscribe();
  }

  pushAutocompleteQuery(q: string): void { this._autocompleteQuery$.next(q); }
  closeAutocomplete(): void { this.autocompleteVisible.set(false); }

  // ── Cart ────────────────────────────────────────────────────────────────────
  readonly cartItems = signal<Map<string, number>>(new Map());

  readonly cartCount = computed(() => {
    let total = 0;
    this.cartItems().forEach(qty => (total += qty));
    return total;
  });

  addToCart(productId: string, qty = 1): void {
    this.cartItems.update(map => {
      const next = new Map(map);
      next.set(productId, (next.get(productId) ?? 0) + qty);
      return next;
    });
  }

  updateCartQty(productId: string, qty: number): void {
    this.cartItems.update(map => {
      const next = new Map(map);
      if (qty <= 0) next.delete(productId); else next.set(productId, qty);
      return next;
    });
  }

  getCartQty(productId: string): number {
    return this.cartItems().get(productId) ?? 0;
  }

  // ── Categories List ─────────────────────────────────────────────────────────
  readonly categoriesLoading = signal(false);
  readonly categoriesError   = signal<string | null>(null);
  readonly categoriesData    = signal<Category[]>([]);

  /**
   * GET /api/customer/categories
   * Unwraps envelope → maps RawCategory[] → Category[] → stores in categoriesData.
   */
  loadCategories(): void {
    if (this.categoriesLoading()) return;   // guard against duplicate calls
    this.categoriesLoading.set(true);
    this.categoriesError.set(null);

    this.http
      .get<RawCategoryResponse>(`${API_BASE}/categories`)
      .pipe(
        tap(res => {
          const mapped = (res.data ?? []).map(mapRawCategoryToCategory);
          this.categoriesData.set(mapped);
        }),
        catchError(err => {
          this.categoriesError.set(err?.error?.message ?? 'Failed to load categories.');
          return of(null);
        }),
        finalize(() => this.categoriesLoading.set(false))
      )
      .subscribe();
  }

  // ── Category Products ───────────────────────────────────────────────────────
  readonly categoryProductsLoading = signal(false);
  readonly categoryProductsError   = signal<string | null>(null);
  readonly categoryProductsData    = signal<PaginatedResponse<Product> | null>(null);

  /** Tracks which category is currently loaded so pages can derive category name. */
  readonly selectedCategoryId = signal<string | null>(null);

  /**
   * GET /api/customer/categories/{id}/products
   *
   * Supports: Search, BrandId, MinPrice, MaxPrice, SortBy, PageIndex, PageSize
   * Unwraps envelope → maps RawPaginatedProducts → PaginatedResponse<Product>
   */
  loadCategoryProducts(
    categoryId: number | string,
    params?: Partial<{
      Search:     string;
      BrandId:    number;
      MinPrice:   number;
      MaxPrice:   number;
      SortBy:     string;
      PageIndex:  number;
      PageSize:   number;
    }>
  ): void {
    this.categoryProductsLoading.set(true);
    this.categoryProductsError.set(null);
    this.selectedCategoryId.set(String(categoryId));

    const query = {
      PageIndex: 1,
      PageSize:  DEFAULT_PAGE_SIZE,
      ...params,
    };

    this.http
      .get<RawCategoryProductsResponse>(
        `${API_BASE}/categories/${categoryId}/products`,
        { params: this.buildHttpParams(query) }
      )
      .pipe(
        tap(res => {
          const mapped = mapCategoryProductsResponse(res.data);
          this.categoryProductsData.set(mapped);
        }),
        catchError(err => {
          this.categoryProductsError.set(
            err?.error?.message ?? 'Failed to load category products.'
          );
          return of(null);
        }),
        finalize(() => this.categoryProductsLoading.set(false))
      )
      .subscribe();
  }

  /** Clears category-products state – call on component destroy to avoid stale data. */
  resetCategoryProducts(): void {
    this.categoryProductsData.set(null);
    this.categoryProductsError.set(null);
    this.selectedCategoryId.set(null);
  }

  // ── NEW: Brands List (homepage + browse) ─────────────────────────────────────
  readonly brandsLoading = signal(false);
  readonly brandsError   = signal<string | null>(null);
  readonly brandsData    = signal<BrandSummary[]>([]);

  /**
   * GET /api/customer/brands
   * Supports: Search, Category, SortBy, PageIndex, PageSize
   * Unwraps envelope → maps RawBrandSummary[] → BrandSummary[] → stores in brandsData.
   *
   * Used on the homepage to show a small "Featured Brands" strip (first page,
   * default page size) — same pattern as loadCategories().
   */
  loadBrands(
    params?: Partial<{
      Search:    string;
      Category:  string;
      SortBy:    string;
      PageIndex: number;
      PageSize:  number;
    }>
  ): void {
    if (this.brandsLoading()) return;   // guard against duplicate calls
    this.brandsLoading.set(true);
    this.brandsError.set(null);

    const query = {
      PageIndex: 1,
      PageSize:  DEFAULT_PAGE_SIZE,
      ...params,
    };

    this.http
      .get<RawBrandsResponse>(`${API_BASE}/brands`, {
        params: this.buildHttpParams(query),
      })
      .pipe(
        tap(res => {
          const mapped = mapBrandsResponse(res.data);
          this.brandsData.set(mapped.data);
        }),
        catchError(err => {
          this.brandsError.set(err?.error?.message ?? 'Failed to load brands.');
          return of(null);
        }),
        finalize(() => this.brandsLoading.set(false))
      )
      .subscribe();
  }

  // ── NEW: Brand Details (single brand + its product list) ─────────────────────
  readonly brandDetailsLoading = signal(false);
  readonly brandDetailsError   = signal<string | null>(null);
  readonly brandDetails        = signal<BrandDetails | null>(null);

  /**
   * GET /api/customer/brands/{id}
   * Returns business profile fields + an embedded products[] array.
   * Unwraps envelope → maps RawBrandDetails → BrandDetails.
   */
  loadBrandDetails(id: string | number): void {
    this.brandDetailsLoading.set(true);
    this.brandDetailsError.set(null);

    this.http
      .get<RawBrandDetailsResponse>(`${API_BASE}/brands/${id}`)
      .pipe(
        tap(res => this.brandDetails.set(mapRawBrandDetailsToBrandDetails(res.data))),
        catchError(err => {
          this.brandDetailsError.set(err?.error?.message ?? 'Failed to load brand details.');
          this.brandDetails.set(null);
          return of(null);
        }),
        finalize(() => this.brandDetailsLoading.set(false))
      )
      .subscribe();
  }

  resetBrandDetailsState(): void {
    this.brandDetails.set(null);
    this.brandDetailsError.set(null);
  }

  // ── NEW: Brand Products (paginated, filterable — mirrors category products) ──
  readonly brandProductsLoading = signal(false);
  readonly brandProductsError   = signal<string | null>(null);
  readonly brandProductsData    = signal<PaginatedResponse<Product> | null>(null);

  /** Tracks which brand is currently loaded so pages can derive brand name. */
  readonly selectedBrandId = signal<string | null>(null);

  /**
   * GET /api/customer/brands/{id}/products
   * Supports: Search, CategoryId, MinPrice, MaxPrice, SortBy, PageIndex, PageSize
   * Unwraps envelope → maps RawPaginatedProducts → PaginatedResponse<Product>.
   */
  loadBrandProducts(
    brandId: number | string,
    params?: Partial<{
      Search:     string;
      CategoryId: number;
      MinPrice:   number;
      MaxPrice:   number;
      SortBy:     string;
      PageIndex:  number;
      PageSize:   number;
    }>
  ): void {
    this.brandProductsLoading.set(true);
    this.brandProductsError.set(null);
    this.selectedBrandId.set(String(brandId));

    const query = {
      PageIndex: 1,
      PageSize:  DEFAULT_PAGE_SIZE,
      ...params,
    };

    this.http
      .get<RawBrandProductsResponse>(
        `${API_BASE}/brands/${brandId}/products`,
        { params: this.buildHttpParams(query) }
      )
      .pipe(
        tap(res => {
          const mapped = mapBrandProductsResponse(res.data);
          this.brandProductsData.set(mapped);
        }),
        catchError(err => {
          this.brandProductsError.set(
            err?.error?.message ?? 'Failed to load brand products.'
          );
          return of(null);
        }),
        finalize(() => this.brandProductsLoading.set(false))
      )
      .subscribe();
  }

  // ── Product Reviews ────────────────────────────────────────────────────────
  
  /**
   * GET /api/customer/products/{id}/reviews
   * Fetches the reviews of a specific product with optional filters.
   */
  getProductReviews(
    productId: number | string,
    params?: {
      Rating?: number;
      SortBy?: string;
      PageIndex?: number;
      PageSize?: number;
    }
  ) {
    const query = {
      PageIndex: 1,
      PageSize: 10,
      ...params
    };
    return this.http.get<RawProductReviewsResponse>(
      `${API_BASE}/products/${productId}/reviews`,
      { params: this.buildHttpParams(query) }
    );
  }

  /**
   * GET /api/customer/products/{id}/reviews/distribution
   * Fetches the rating/star distribution of a specific product.
   */
  getReviewDistribution(productId: number | string) {
    return this.http.get<RawReviewDistributionResponse>(
      `${API_BASE}/products/${productId}/reviews/distribution`
    );
  }

  /**
   * POST /api/customer/products/{id}/reviews
   * Submits a new review for a product using FormData (multipart/form-data).
   */
  createProductReview(
    productId: number | string,
    reviewData: {
      ProductId: number;
      Rating: number;
      ReviewTitle?: string;
      ReviewText: string;
      IsAnonymous: boolean;
      photos?: File[];
    }
  ) {
    const formData = new FormData();
    formData.append('ProductId', String(reviewData.ProductId));
    formData.append('Rating', String(reviewData.Rating));
    if (reviewData.ReviewTitle) {
      formData.append('ReviewTitle', reviewData.ReviewTitle);
    }
    formData.append('ReviewText', reviewData.ReviewText);
    formData.append('IsAnonymous', String(reviewData.IsAnonymous));
    
    if (reviewData.photos && reviewData.photos.length > 0) {
      reviewData.photos.forEach(photo => {
        formData.append('photos', photo, photo.name);
      });
    }

    return this.http.post<RawCreateReviewResponse>(
      `${API_BASE}/products/${productId}/reviews`,
      formData
    );
  }

  /**
   * POST /api/customer/reviews/{reviewId}/helpful
   * Votes a review as helpful.
   */
  voteReviewHelpful(reviewId: number | string) {
    return this.http.post<RawHelpfulResponse>(
      `${API_BASE}/reviews/${reviewId}/helpful`,
      {}
    );
  }

  // ── NEW: Personalized Recommendations ────────────────────────────────────────
  readonly recommendationsLoading = signal(false);
  readonly recommendationsError   = signal<string | null>(null);
  readonly recommendationsData    = signal<Product[]>([]);

  /**
   * POST /api/Recommendation/customer
   * ML-driven personalized product suggestions for the logged-in customer.
   * Not scoped under API_BASE since it lives outside /api/customer.
   */
  loadRecommendations(topK: number = 10): void {
    if (this.recommendationsLoading()) return;   // guard against duplicate calls
    this.recommendationsLoading.set(true);
    this.recommendationsError.set(null);

    this.http
      .post<CustomerRecommendationResponse>(
        `${environment.baseUrl}/api/Recommendation/customer`,
        { topK }
      )
      .pipe(
        tap(res => this.recommendationsData.set(mapRecommendationsToProducts(res.recommendations))),
        catchError(err => {
          this.recommendationsError.set(err?.error?.message ?? 'Failed to load recommendations.');
          return of(null);
        }),
        finalize(() => this.recommendationsLoading.set(false))
      )
      .subscribe();
  }

  /** Clears brand-products state – call on component destroy to avoid stale data. */
  resetBrandProducts(): void {
    this.brandProductsData.set(null);
    this.brandProductsError.set(null);
    this.selectedBrandId.set(null);
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