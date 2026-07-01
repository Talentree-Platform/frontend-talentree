/**
 * Matches the REAL API response from
 * GET /api/customer/products/{id}
 *
 * The endpoint returns an envelope: { success, data, message, errors, timestamp }.
 * `data` is the actual product. `data.similarProducts` already contains
 * related products — no second API call is needed for recommendations.
 */

export interface SimilarProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  avgRating: number;
  categoryName: string;
  categoryId: number;
  brandName: string;
  brandId: number;
  imageUrls: string[];
}

export interface ProductDetailsData {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  avgRating: number;
  tags: string;
  categoryName: string;
  categoryId: number;
  brandName: string;
  brandId: number;
  brandLogoUrl: string;
  imageUrls: string[];
  similarProducts: SimilarProduct[];
}

export interface ProductDetailsResponse {
  success: boolean;
  data: ProductDetailsData;
  message: string;
  errors: string[] | null;
  timestamp: string;
}