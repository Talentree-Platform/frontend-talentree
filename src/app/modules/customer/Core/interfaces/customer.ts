// ─────────────────────────────────────────────
// Talentree – Customer Marketplace Models
// ─────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
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
  unit?: string;          // e.g. "kg", "piece", "litre"
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