export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
  errors: any;
  timestamp: string;
}
export interface MaterialOrder {
  id: number;
  createdAt: string;
  status: number;
  paymentStatus: number;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryCountry: string;
  contactPhone: string;
  totalAmount: number;
  items: MaterialOrderItem[];
}
export interface MaterialOrderItem {
  id: number;
  rawMaterialId: number;
  materialName: string;
  unit: string;
  quantity: number;
  unitPriceAtPurchase: number;
  lineTotal: number;
}