export type OwnerProductStatus =
  | 'active'
  | 'draft'
  | 'under_review'
  | 'rejected'
  | 'out_of_stock';

export interface OwnerProduct {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: OwnerProductStatus;
  sales: number;
  rating: number;
  imageUrl: string;
  dateAdded: string;
  views: number;
}

/** Image row from GET product (for edit / delete-by-id). id 0 = url-only (delete not supported server-side). */
export interface OwnerProductImageRef {
  id: number;
  url: string;
}

/** Single-product payload from GET /api/BusinessOwnerProducts/{id} */
export interface OwnerProductDetail {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  tagsRaw: string;
  tagList: string[];
  status: number;
  statusText: string;
  statusNormalized: OwnerProductStatus;
  categoryName: string;
  /** When API sends CategoryId */
  categoryId: number | null;
  mainImageUrl: string;
  images: string[];
  /** Detailed image rows (ids for PUT ImagesToDelete) */
  productImages: OwnerProductImageRef[];
  createdAt: string | null;
  updatedAt: string | null;
}