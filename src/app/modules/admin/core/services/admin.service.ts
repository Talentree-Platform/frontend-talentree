import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginationQuery } from '../Interfaces/PaginationQuery';
import { ApiResponse, BusinessOwner, PaginatedResponse } from '../Interfaces/ibusiness-owner';
import { environment } from '../../../../core/environment/envirinment';

// ── Admin DTOs ────────────────────────────────────────────────────────────────

export interface AdminDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateAdminDto {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber?: string;
}

// ─────────────────────────────────────────────────────────────────────────────

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private _HttpClient:HttpClient) { }
  private readonly adminApiUrl = `${environment.baseUrl}/api/Admin`;
  private readonly adminManagementApiUrl = `${environment.baseUrl}/api/admin-management`;
  // apiUrl='/api/Admin';
  private readonly adminProductApiUrl = '/api/AdminProduct';

  /**
   * GET /api/AdminProduct/products/pending
   * Response: ApiResponse with PaginatedResponse in data; items in data.data.
   */
  getPendingProducts(
    pageIndex: number,
    pageSize: number
  ): Observable<ApiResponse<PaginatedResponse<unknown>>> {
    const params = new HttpParams()
      .set('pageIndex', String(pageIndex))
      .set('pageSize', String(pageSize));
    return this._HttpClient.get<ApiResponse<PaginatedResponse<unknown>>>(
      `${this.adminProductApiUrl}/products/pending`,
      { params }
    );
  }

  /** POST /api/AdminProduct/products/approve */
  approveProduct(productId: number, notes: string): Observable<ApiResponse<null>> {
    return this._HttpClient.post<ApiResponse<null>>(`${this.adminProductApiUrl}/products/approve`, {
      productId,
      notes: notes ?? ''
    });
  }

  /** POST /api/AdminProduct/products/reject */
  rejectProduct(productId: number, reason: string): Observable<ApiResponse<null>> {
    return this._HttpClient.post<ApiResponse<null>>(`${this.adminProductApiUrl}/products/reject`, {
      productId,
      reason
    });
  }

  getPendingBusinessOwner(params?:PaginationQuery):Observable<ApiResponse<PaginatedResponse<BusinessOwner>>>{
      let httpPram=new HttpParams();
      if (params){
        httpPram = httpPram
    .set('pageIndex', String(params.pageIndex))
    .set('pageSize', String(params.pageSize));
      }
    return this._HttpClient.get<ApiResponse<PaginatedResponse<BusinessOwner>>>(`${this.adminApiUrl}/business-owners/pending` , {params:httpPram})
    }

  

  // ── Business Owners ───────────────────────────────────────────────────────


  getBusinessOwnerById(profileId: number): Observable<ApiResponse<BusinessOwner>> {
    return this._HttpClient.get<ApiResponse<BusinessOwner>>(
      `${this.adminApiUrl}/business-owners/${profileId}`
    );
  }

  rejectOwner(profileId: number | undefined,rejectionReason: string): Observable<ApiResponse<null>> {
    return this._HttpClient.post<ApiResponse<null>>(`${this.adminApiUrl}/business-owners/reject`, {
      profileId,
      rejectionReason
    });}

  ApproveOwner(profileId: number | undefined, notes: string): Observable<ApiResponse<null>> {
    return this._HttpClient.post<ApiResponse<null>>(
      `${this.adminApiUrl}/business-owners/approve`, { profileId, notes }
    );
  }

  

  // ── Admins ────────────────────────────────────────────────────────────────

  getAllAdmins(): Observable<ApiResponse<AdminDto[]>> {
    return this._HttpClient.get<ApiResponse<AdminDto[]>>(`${this.adminManagementApiUrl}/admins`);
  }

  createAdmin(dto: CreateAdminDto): Observable<ApiResponse<AdminDto>> {
  return this._HttpClient.post<ApiResponse<AdminDto>>(
    `${this.adminManagementApiUrl}/create`, dto
    );
  }

  deactivateAdmin(adminId: string): Observable<ApiResponse<null>> {
    return this._HttpClient.post<ApiResponse<null>>(
      `${this.adminManagementApiUrl}/admins/${adminId}/deactivate`, {}
    );
  }

  reactivateAdmin(adminId: string): Observable<ApiResponse<null>> {
    return this._HttpClient.post<ApiResponse<null>>(
      `${this.adminManagementApiUrl}/admins/${adminId}/reactivate`, {}
    );
  }
}
