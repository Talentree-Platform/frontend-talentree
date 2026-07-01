// ── Supplier Interfaces ───────────────────────────────────────────────────────

export interface Supplier {
  id: number;
  name: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  contactPerson: string;
  taxId: string | null;
  isActive: boolean;
  materialCount: number;
}

export interface CreateSupplierDto {
  name: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  contactPerson: string;
  taxId?: string;
}

export interface UpdateSupplierDto {
  name: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  contactPerson: string;
  taxId?: string;
  isActive: boolean;
}

export interface SupplierFilterParams {
  search?: string;
  isActive?: boolean;
  pageIndex?: number;
  pageSize?: number;
}

// ── Supplier Performance Interfaces ──────────────────────────────────────────

export interface SupplierPerformanceItem {
  supplierId?: number | null;
  supplierName?: string | null;
  totalOrders?: number | null;
  totalRevenue?: number | null;
  averageOrderValue?: number | null;
  averageFulfillmentTimeHours?: number | null;
  averageRating?: number | null;
  totalReviews?: number | null;
  issueRatePercentage?: number | null;
}

export interface SupplierPerformanceData {
  totalSuppliers?: number | null;
  activeSuppliers?: number | null;
  inactiveSuppliers?: number | null;
  averageRating?: number | null;
  suppliers?: SupplierPerformanceItem[] | null;
  [key: string]: unknown;
}