// material.model.ts
export interface Material {
  id: number;
  name: string;
  description: string;
  price: number;
  unit: string;
  minimumOrderQuantity: number;
  stockQuantity: number;
  isAvailable: boolean;
  category: string;
  pictureUrl: string | null;
  supplierName: string;
}

export interface PaginatedMaterialResponse<T> {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: T[];
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  firstItemIndex: number;
  lastItemIndex: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors: any;
  timestamp: string;
}