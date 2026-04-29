// ── Raw Material Interfaces ───────────────────────────────────────────────────

export interface RawMaterial {
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
  supplierId: number;
  supplierName: string;
  createdAt: string;
}

export interface CreateRawMaterialDto {
  name: string;
  description: string;
  price: number;
  unit: string;
  minimumOrderQuantity: number;
  stockQuantity: number;
  category: string;
  supplierId: number;
  pictureUrl?: string;
}

export interface UpdateRawMaterialDto {
  name: string;
  description: string;
  price: number;
  unit: string;
  minimumOrderQuantity: number;
  stockQuantity: number;
  category: string;
  supplierId: number;
  isAvailable: boolean;
  pictureUrl?: string;
}

export interface RestockMaterialDto {
  quantityToAdd: number;
}

export interface RawMaterialFilterParams {
  category?: string;
  search?: string;
  isAvailable?: boolean;
  pageIndex?: number;
  pageSize?: number;
}