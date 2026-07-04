// ─────────────────────────────────────────────────────────────────────────────
// Talentree – Customer Marketplace Models  (FULL FILE — ORIGINAL + BRANDS)
// ─────────────────────────────────────────────────────────────────────────────
// This is the COMPLETE file. Replace the entire contents of
// src/app/modules/customer/Core/interfaces/customer.ts with this file.
// Nothing needs to be merged manually — every original export is here,
// plus the new Brand-related types/mappers at the bottom.
// ─────────────────────────────────────────────────────────────────────────────

// ── Clean App Models ──────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  productCount?: number;
}

export interface Brand {
  id: string;
  name: string;
  logoUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  images?: string[];
  categoryId: string;
  categoryName?: string;
  brandId?: string;
  brandName?: string;
  vendorName?: string;
  rating?: number;
  reviewCount?: number;
  stockQuantity: number;
  isAvailable: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
  tags?: string[];
  unit?: string;
  minOrderQty?: number;
  createdAt?: string;
}

export interface HomepageData {
  categories: Category[];
  featuredProducts: Product[];
  trendingProducts: Product[];
}

export interface HomepageResponse {
  success: boolean;
  data: HomepageData;
}

export interface PaginatedResponse<T> {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: T[];
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface ProductQueryParams {
  search?: string;
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: SortOption;
  pageIndex?: number;
  pageSize?: number;
}

export type SortOption =
  | 'price_asc'
  | 'price_desc'
  | 'newest'
  | 'rating'
  | 'popularity';

export interface AutocompleteItem {
  id: string;
  name: string;
  category?: string;
  imageUrl?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface FilterState {
  search: string;
  categoryId: string | null;
  brandId: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  sortBy: SortOption;
}

// ── Category-specific filter state ────────────────────────────────────────────

export interface CategoryFilterState {
  search: string;
  brandId: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  sortBy: string;
  pageIndex: number;
  pageSize: number;
}

// ── Raw API Shapes ────────────────────────────────────────────────────────────

export interface RawCategory {
  id: number;
  name: string;
  description: string;
}

export interface RawProduct {
  id: number;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  avgRating: number;
  categoryName: string;
  categoryId: number;
  brandName: string;
  brandId: number;
  imageUrls: string[];
}

export interface RawHomepageData {
  categories: RawCategory[];
  featuredProducts: RawProduct[];
  trendingProducts: RawProduct[];
}

export interface RawHomepageResponse {
  success: boolean;
  data: RawHomepageData;
  message: string;
  errors: unknown;
  timestamp: string;
}

// ── Raw Shapes for Categories API ─────────────────────────────────────────────

/**
 * Raw envelope returned by GET /api/customer/categories
 */
export interface RawCategoryResponse {
  success: boolean;
  data: RawCategory[];
  message: string;
  errors: unknown;
  timestamp: string;
}

/**
 * Clean mapped result for the categories list endpoint
 */
export type CategoryResponse = Category[];

// ── Raw Shapes for Category Products API ──────────────────────────────────────

/**
 * Paginated wrapper inside the envelope data field
 */
export interface RawPaginatedProducts {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: RawProduct[];
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  firstItemIndex?: number;
  lastItemIndex?: number;
}

/**
 * Full envelope returned by GET /api/customer/categories/{id}/products
 */
export interface RawCategoryProductsResponse {
  success: boolean;
  data: RawPaginatedProducts;
  message: string;
  errors: unknown;
  timestamp: string;
}

/**
 * Clean mapped result for the category-products endpoint
 */
export type CategoryProductsResponse = PaginatedResponse<Product>;

// ── Mappers ───────────────────────────────────────────────────────────────────

const PLACEHOLDER_IMAGE = 'assets/images/placeholder-product.png';

export function mapRawProductToProduct(raw: RawProduct): Product {
  return {
    id: String(raw.id),
    name: raw.name,
    description: raw.description,
    price: raw.price,
    imageUrl: raw.imageUrls?.[0] ?? PLACEHOLDER_IMAGE,
    images: raw.imageUrls ?? [],
    categoryId: String(raw.categoryId),
    categoryName: raw.categoryName,
    brandId: raw.brandId ? String(raw.brandId) : undefined,
    brandName: raw.brandName || undefined,
    rating: raw.avgRating,
    stockQuantity: raw.stockQuantity,
    isAvailable: raw.stockQuantity > 0,
  };
}

export function mapRawProductsToProducts(raws: RawProduct[]): Product[] {
  return (raws ?? []).map(mapRawProductToProduct);
}

export function mapRawCategoryToCategory(raw: RawCategory): Category {
  return {
    id: String(raw.id),
    name: raw.name,
    slug: raw.name.toLowerCase().trim().replace(/\s+/g, '-'),
    description: raw.description,
  };
}

export function mapRawHomepageData(raw: RawHomepageData): HomepageData {
  return {
    categories: (raw.categories ?? []).map(mapRawCategoryToCategory),
    featuredProducts: mapRawProductsToProducts(raw.featuredProducts),
    trendingProducts: mapRawProductsToProducts(raw.trendingProducts),
  };
}

// ── Category Products Mapper ───────────────────────────────────────────────────

/**
 * Transforms the raw paginated-products envelope data field
 * into a clean PaginatedResponse<Product> consumed by components.
 */
export function mapCategoryProductsResponse(
  raw: RawPaginatedProducts
): PaginatedResponse<Product> {
  return {
    pageIndex: raw.pageIndex,
    pageSize: raw.pageSize,
    count: raw.count,
    data: mapRawProductsToProducts(raw.data ?? []),
    totalPages: raw.totalPages,
    hasPrevious: raw.hasPrevious,
    hasNext: raw.hasNext,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ── NEW: BRANDS ────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

// ── Clean App Model — BrandSummary (list view) ────────────────────────────────

export interface BrandSummary {
  id: string;
  businessName: string;
  businessDescription?: string;
  businessCategory?: string;
  businessLogoUrl?: string;
  profilePhotoUrl?: string;
  productCount?: number;
}

// ── Clean App Model — BrandDetails (single brand + its products) ─────────────

export interface BrandDetails {
  id: string;
  businessName: string;
  businessDescription?: string;
  businessCategory?: string;
  businessAddress?: string;
  facebookLink?: string | null;
  instagramLink?: string | null;
  websiteLink?: string | null;
  businessLogoUrl?: string;
  profilePhotoUrl?: string;
  products: Product[];
}

// ── Brand filter state (mirrors CategoryFilterState) ──────────────────────────

export interface BrandFilterState {
  search: string;
  categoryId: number | null;
  sortBy: string;
  pageIndex: number;
  pageSize: number;
}

export interface BrandProductsFilterState {
  search: string;
  categoryId: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  sortBy: string;
  pageIndex: number;
  pageSize: number;
}

// ── Raw API Shapes — Brands List ───────────────────────────────────────────────

export interface RawBrandSummary {
  id: number;
  businessName: string;
  businessDescription: string;
  businessCategory: string;
  businessLogoUrl: string;
  profilePhotoUrl: string;
  productCount: number;
}

export interface RawPaginatedBrands {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: RawBrandSummary[];
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  firstItemIndex?: number;
  lastItemIndex?: number;
}

/**
 * Full envelope returned by GET /api/customer/brands
 */
export interface RawBrandsResponse {
  success: boolean;
  data: RawPaginatedBrands;
  message: string;
  errors: unknown;
  timestamp: string;
}

/**
 * Clean mapped result for the brands list endpoint
 */
export type BrandsResponse = PaginatedResponse<BrandSummary>;

// ── Raw API Shapes — Brand Details ────────────────────────────────────────────

/**
 * Full envelope returned by GET /api/customer/brands/{id}
 * Note: products[] inside the envelope are RawProduct — reuse existing mapper.
 */
export interface RawBrandDetails {
  id: number;
  businessName: string;
  businessDescription: string;
  businessCategory: string;
  businessAddress: string;
  facebookLink: string | null;
  instagramLink: string | null;
  websiteLink: string | null;
  businessLogoUrl: string;
  profilePhotoUrl: string;
  products: RawProduct[];
}

export interface RawBrandDetailsResponse {
  success: boolean;
  data: RawBrandDetails;
  message: string;
  errors: unknown;
  timestamp: string;
}

// ── Raw API Shapes — Brand Products (paginated, filterable) ──────────────────

/**
 * Full envelope returned by GET /api/customer/brands/{id}/products
 */
export interface RawBrandProductsResponse {
  success: boolean;
  data: RawPaginatedProducts;
  message: string;
  errors: unknown;
  timestamp: string;
}

/**
 * Clean mapped result for the brand-products endpoint
 */
export type BrandProductsResponse = PaginatedResponse<Product>;

// ── Mappers — Brands ──────────────────────────────────────────────────────────

export function mapRawBrandSummaryToBrandSummary(raw: RawBrandSummary): BrandSummary {
  return {
    id: String(raw.id),
    businessName: raw.businessName || 'Unnamed Brand',
    businessDescription: raw.businessDescription || undefined,
    businessCategory: raw.businessCategory || undefined,
    businessLogoUrl: raw.businessLogoUrl || undefined,
    profilePhotoUrl: raw.profilePhotoUrl || undefined,
    productCount: raw.productCount,
  };
}

export function mapRawBrandsToBrandSummaries(raws: RawBrandSummary[]): BrandSummary[] {
  return (raws ?? []).map(mapRawBrandSummaryToBrandSummary);
}

/**
 * Transforms the raw paginated-brands envelope data field
 * into a clean PaginatedResponse<BrandSummary>.
 */
export function mapBrandsResponse(raw: RawPaginatedBrands): PaginatedResponse<BrandSummary> {
  return {
    pageIndex: raw.pageIndex,
    pageSize: raw.pageSize,
    count: raw.count,
    data: mapRawBrandsToBrandSummaries(raw.data ?? []),
    totalPages: raw.totalPages,
    hasPrevious: raw.hasPrevious,
    hasNext: raw.hasNext,
  };
}

/**
 * Transforms the raw brand-details envelope data field
 * into a clean BrandDetails (products mapped via existing mapRawProductsToProducts).
 */
export function mapRawBrandDetailsToBrandDetails(raw: RawBrandDetails): BrandDetails {
  return {
    id: String(raw.id),
    businessName: raw.businessName || 'Unnamed Brand',
    businessDescription: raw.businessDescription || undefined,
    businessCategory: raw.businessCategory || undefined,
    businessAddress: raw.businessAddress || undefined,
    facebookLink: raw.facebookLink,
    instagramLink: raw.instagramLink,
    websiteLink: raw.websiteLink,
    businessLogoUrl: raw.businessLogoUrl || undefined,
    profilePhotoUrl: raw.profilePhotoUrl || undefined,
    products: mapRawProductsToProducts(raw.products ?? []),
  };
}

/**
 * Transforms the raw paginated brand-products envelope data field
 * into a clean PaginatedResponse<Product> (identical shape to category products).
 */
export function mapBrandProductsResponse(raw: RawPaginatedProducts): PaginatedResponse<Product> {
  return {
    pageIndex: raw.pageIndex,
    pageSize: raw.pageSize,
    count: raw.count,
    data: mapRawProductsToProducts(raw.data ?? []),
    totalPages: raw.totalPages,
    hasPrevious: raw.hasPrevious,
    hasNext: raw.hasNext,
  };
}

// ── Review Models ─────────────────────────────────────────────────────────────

export interface ProductReview {
  id: number;
  productId: number;
  customerName: string;
  reviewTitle: string | null;
  rating: number;
  reviewText: string;
  isAnonymous: boolean;
  helpfulVotes: number;
  ownerResponse: string | null;
  responseAt: string | null;
  createdAt: string;
  photoUrls: string[];
}

export interface ReviewDistribution {
  totalReviews: number;
  averageRating: number;
  starCounts: { [star: string]: number };
}

export interface RawProductReviewsResponse {
  success: boolean;
  data: PaginatedResponse<ProductReview>;
  message: string;
  errors: unknown;
  timestamp: string;
}

export interface RawReviewDistributionResponse {
  success: boolean;
  data: ReviewDistribution;
  message: string;
  errors: unknown;
  timestamp: string;
}

export interface RawCreateReviewResponse {
  success: boolean;
  data: ProductReview;
  message: string;
  errors: unknown;
  timestamp: string;
}

export interface RawHelpfulResponse {
  success: boolean;
  data: null;
  message: string;
  errors: unknown;
  timestamp: string;
}