export interface ProductionRequestItem {
  id: number;
  productType: string;
  quantity: number;
  specifications?: string | null;
  preferredRawMaterialId?: number | null;
  preferredRawMaterialName?: string | null;
}

export interface StatusHistory {
  status: string;
  changedAt: string;
  notes?: string | null;
}

export interface ProductionRequest {
  id: number;
  title: string;
  notes?: string | null;
  status: number; // ✅ fixed
  createdAt: string;
  quotedPrice?: number | null;
  estimatedCompletionDate?: string | null;
  completedAt?: string | null;

  // ❗ optional because not in response
  items?: ProductionRequestItem[];
  statusHistory?: StatusHistory[];
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface ApiResponse<T> {
  message?: string;
  data: T;
  success: boolean;
  errors?: any;
  timestamp?: string;
}