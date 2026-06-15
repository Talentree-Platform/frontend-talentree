import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../core/environment/envirinment';

// ── Shared ────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
  errors: string[];
  timestamp: string;
}

export interface PaginatedResponse<T> {
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

export interface ActionLog {
  id: number;
  action: string;
  reason: string;
  notes: string;
  actionDate: string;
  adminName: string;
  adminEmail: string;
}

// ── Business Owner DTOs ───────────────────────────────────────────────────────

export interface BusinessOwnerListItem {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  category: string;
  approvalStatus: number;
  approvalStatusText: string;
  accountStatus: number;
  accountStatusText: string;
  registrationDate: string;
  lastLoginAt: string;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  isSuspended: boolean;
  isBanned: boolean;
  isBlocked: boolean;
}

export interface BusinessOwnerDetails {
  id: string;
  email: string;
  phoneNumber: string;
  displayName: string;
  businessName: string;
  businessDescription: string;
  businessCategory: string;
  businessAddress: string;
  taxId: string;
  profilePhotoUrl: string;
  businessLogoUrl: string;
  facebookLink: string;
  instagramLink: string;
  websiteLink: string;
  approvalStatus: number;
  approvalStatusText: string;
  accountStatus: number;
  accountStatusText: string;
  approvedAt: string;
  approvedBy: string;
  rejectionReason: string;
  suspendedAt: string;
  suspendedBy: string;
  suspensionReason: string;
  bannedAt: string;
  bannedBy: string;
  banReason: string;
  isBlocked: boolean;
  blockedAt: string;
  blockedBy: string;
  blockReason: string;
  registrationDate: string;
  lastLoginAt: string;
  loginAttempts: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  complaintCount: number;
  actionLogs: ActionLog[];
}

export interface BusinessOwnerFilterParams {
  searchQuery?: string;
  status?: 1 | 2 | 3;           // approval status
  accountStatus?: 1 | 2 | 3 | 4;
  category?: string;
  registrationDateFrom?: string;
  registrationDateTo?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface SuspendDto {
  userId: string;
  reason: string;   // min 10 chars (swagger: "stringstri")
  notes?: string;
}

export interface BanDto {
  userId: string;
  reason: string;
  notes?: string;
  isPermanent: boolean;
}

export interface BlockDto {
  userId: string;
  reason: string;
}

// ── Customer DTOs ─────────────────────────────────────────────────────────────

export interface CustomerListItem {
  id: string;
  name: string;
  email: string;
  registrationDate: string;
  lastLoginAt: string;
  totalOrders: number;
  totalSpent: number;
  accountStatus: number;
  accountStatusText: string;
  isBlocked: boolean;
}

export interface CustomerDetails {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  profilePhotoUrl: string;
  registrationDate: string;
  lastLoginAt: string;
  accountStatus: number;
  accountStatusText: string;
  isBlocked: boolean;
  blockedAt: string;
  blockedBy: string;
  blockReason: string;
  totalOrders: number;
  totalSpent: number;
  totalReviews: number;
  actionLogs: ActionLog[];
}

export interface CustomerFilterParams {
  searchQuery?: string;
  accountStatus?: 1 | 2 | 3 | 4;
  registrationDateFrom?: string;
  registrationDateTo?: string;
  pageIndex?: number;
  pageSize?: number;
}

// ─────────────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AdminUserManagementService {

  private readonly apiUrl = `${environment.baseUrl}/api/admin/users`;

  constructor(private _HttpClient: HttpClient) {}

  // ── Business Owners ───────────────────────────────────────────────────────

  getBusinessOwners(
    params?: BusinessOwnerFilterParams
  ): Observable<ApiResponse<PaginatedResponse<BusinessOwnerListItem>>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.searchQuery)          httpParams = httpParams.set('searchQuery', params.searchQuery);
      if (params.status)               httpParams = httpParams.set('status', params.status);
      if (params.accountStatus)        httpParams = httpParams.set('accountStatus', params.accountStatus);
      if (params.category)             httpParams = httpParams.set('category', params.category);
      if (params.registrationDateFrom) httpParams = httpParams.set('registrationDateFrom', params.registrationDateFrom);
      if (params.registrationDateTo)   httpParams = httpParams.set('registrationDateTo', params.registrationDateTo);
      if (params.pageIndex)            httpParams = httpParams.set('pageIndex', params.pageIndex);
      if (params.pageSize)             httpParams = httpParams.set('pageSize', params.pageSize);
    }
    return this._HttpClient.get<ApiResponse<PaginatedResponse<BusinessOwnerListItem>>>(
      `${this.apiUrl}/business-owners`, { params: httpParams }
    );
  }

  getBusinessOwnerById(
    userId: string
  ): Observable<ApiResponse<BusinessOwnerDetails>> {
    return this._HttpClient.get<ApiResponse<BusinessOwnerDetails>>(
      `${this.apiUrl}/business-owners/${userId}`
    );
  }

  suspendBusinessOwner(dto: SuspendDto): Observable<ApiResponse<string>> {
    return this._HttpClient.post<ApiResponse<string>>(
      `${this.apiUrl}/business-owners/suspend`, dto
    );
  }

  unsuspendBusinessOwner(userId: string): Observable<ApiResponse<string>> {
    return this._HttpClient.post<ApiResponse<string>>(
      `${this.apiUrl}/business-owners/${userId}/unsuspend`, {}
    );
  }

  banBusinessOwner(dto: BanDto): Observable<ApiResponse<string>> {
    return this._HttpClient.post<ApiResponse<string>>(
      `${this.apiUrl}/business-owners/ban`, dto
    );
  }

  blockBusinessOwner(dto: BlockDto): Observable<ApiResponse<string>> {
    return this._HttpClient.post<ApiResponse<string>>(
      `${this.apiUrl}/business-owners/block`, dto
    );
  }

  unblockBusinessOwner(userId: string): Observable<ApiResponse<string>> {
    return this._HttpClient.post<ApiResponse<string>>(
      `${this.apiUrl}/business-owners/${userId}/unblock`, {}
    );
  }

  // ── Customers ─────────────────────────────────────────────────────────────

  getCustomers(
    params?: CustomerFilterParams
  ): Observable<ApiResponse<PaginatedResponse<CustomerListItem>>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.searchQuery)          httpParams = httpParams.set('searchQuery', params.searchQuery);
      if (params.accountStatus)        httpParams = httpParams.set('accountStatus', params.accountStatus);
      if (params.registrationDateFrom) httpParams = httpParams.set('registrationDateFrom', params.registrationDateFrom);
      if (params.registrationDateTo)   httpParams = httpParams.set('registrationDateTo', params.registrationDateTo);
      if (params.pageIndex)            httpParams = httpParams.set('pageIndex', params.pageIndex);
      if (params.pageSize)             httpParams = httpParams.set('pageSize', params.pageSize);
    }
    return this._HttpClient.get<ApiResponse<PaginatedResponse<CustomerListItem>>>(
      `${this.apiUrl}/customers`, { params: httpParams }
    );
  }

  getCustomerById(userId: string): Observable<ApiResponse<CustomerDetails>> {
    return this._HttpClient.get<ApiResponse<CustomerDetails>>(
      `${this.apiUrl}/customers/${userId}`
    );
  }

  deleteCustomer(userId: string): Observable<ApiResponse<string>> {
    return this._HttpClient.delete<ApiResponse<string>>(
      `${this.apiUrl}/customers/${userId}`
    );
  }

  blockCustomer(dto: BlockDto): Observable<ApiResponse<string>> {
    return this._HttpClient.post<ApiResponse<string>>(
      `${this.apiUrl}/customers/block`, dto
    );
  }

  unblockCustomer(userId: string): Observable<ApiResponse<string>> {
    return this._HttpClient.post<ApiResponse<string>>(
      `${this.apiUrl}/customers/${userId}/unblock`, {}
    );
  }

  // ── Logs ──────────────────────────────────────────────────────────────────

  getUserLogs(userId: string): Observable<ApiResponse<ActionLog[]>> {
    return this._HttpClient.get<ApiResponse<ActionLog[]>>(
      `/api/admin/users/${userId}/logs`
    );
  }
}