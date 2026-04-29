export interface BasketResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors: any;
  timestamp: string;
}

export interface BasketData<T> {
  id: number;
  items: T[];
  subtotal: number;
  totalItemCount: number;
}

export interface BasketItem {
  id: number;
  rawMaterialId: number;
  materialName: string;
  pictureUrl: string | null;
  unit: string;
  supplierName: string;
  unitPrice: number;
  quantity: number;
  minimumOrderQuantity: number;
  lineTotal: number;
}