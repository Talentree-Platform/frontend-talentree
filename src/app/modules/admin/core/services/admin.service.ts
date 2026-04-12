import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginationQuery } from '../Interfaces/PaginationQuery';
import { ApiResponse, BusinessOwner, PaginatedResponse } from '../Interfaces/ibusiness-owner';

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

  constructor(private _HttpClient: HttpClient) {}

  apiUrl = 'https://talentreeplateform.runasp.net/api/Admin';

  // ── Business Owners ───────────────────────────────────────────────────────

  getPendingBusinessOwner(params?: PaginationQuery)
    : Observable<ApiResponse<PaginatedResponse<BusinessOwner>>> {
    let httpPram = new HttpParams();
    if (params) {
      httpPram = httpPram
        .set('pageIndex', params.pageIndex)
        .set('pageSize', params.pageSize);
    }
    return this._HttpClient.get<ApiResponse<PaginatedResponse<BusinessOwner>>>(
      `${this.apiUrl}/business-owners/pending`, { params: httpPram }
    );
  }

  getBusinessOwnerById(profileId: number): Observable<ApiResponse<BusinessOwner>> {
    return this._HttpClient.get<ApiResponse<BusinessOwner>>(
      `${this.apiUrl}/business-owners/${profileId}`
    );
  }

  ApproveOwner(profileId: number | undefined, notes: string): Observable<ApiResponse<null>> {
    return this._HttpClient.post<ApiResponse<null>>(
      `${this.apiUrl}/business-owners/approve`, { profileId, notes }
    );
  }

  rejectOwner(profileId: number | undefined, rejectionReason: string): Observable<ApiResponse<null>> {
    return this._HttpClient.post<ApiResponse<null>>(
      `${this.apiUrl}/business-owners/reject`, { profileId, rejectionReason }
    );
  }

  // ── Admins ────────────────────────────────────────────────────────────────

  getAllAdmins(): Observable<ApiResponse<AdminDto[]>> {
    return this._HttpClient.get<ApiResponse<AdminDto[]>>(`${this.apiUrl}/admins`);
  }

  createAdmin(dto: CreateAdminDto): Observable<ApiResponse<AdminDto>> {
    return this._HttpClient.post<ApiResponse<AdminDto>>(
      `${this.apiUrl}/create-admin`, dto
    );
  }

  deactivateAdmin(adminId: string): Observable<ApiResponse<null>> {
    return this._HttpClient.post<ApiResponse<null>>(
      `${this.apiUrl}/admins/${adminId}/deactivate`, {}
    );
  }

  reactivateAdmin(adminId: string): Observable<ApiResponse<null>> {
    return this._HttpClient.post<ApiResponse<null>>(
      `${this.apiUrl}/admins/${adminId}/reactivate`, {}
    );
  }
}