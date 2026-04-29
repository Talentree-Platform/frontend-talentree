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