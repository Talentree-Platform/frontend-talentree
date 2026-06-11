export interface MaterialOrder {
  id: number;
  createdAt: string;
  totalAmount: number;
  status: number;
  paymentStatus: number;
  itemCount: number;
  deliveryLocation: string;
}

export interface PaginatedOrders {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: MaterialOrder[];
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  firstItemIndex: number;
  lastItemIndex: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
  errors: string[] | null;
  timestamp: string;
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

export interface MaterialOrderDetails {
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