import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginationQuery } from '../Interfaces/PaginationQuery';
import { ApiResponse, BusinessOwner, PaginatedResponse } from '../Interfaces/ibusiness-owner';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private _HttpClient: HttpClient) { }

  private readonly apiUrl = '/api/Admin';

  // ── Business Owners ───────────────────────────────────────────────────────

  getPendingBusinessOwner(params?: PaginationQuery): Observable<ApiResponse<PaginatedResponse<BusinessOwner>>> {
    let httpParams = new HttpParams();
    if (params) {
      httpParams = httpParams
        .set('pageIndex', String(params.pageIndex))
        .set('pageSize', String(params.pageSize));
    }
    return this._HttpClient.get<ApiResponse<PaginatedResponse<BusinessOwner>>>(
      `${this.apiUrl}/business-owners/pending`, { params: httpParams }
    );
  }

  getBusinessOwnerById(profileId: number): Observable<ApiResponse<BusinessOwner>> {
    return this._HttpClient.get<ApiResponse<BusinessOwner>>(
      `${this.apiUrl}/business-owners/${profileId}`
    );
  }

  approveOwner(profileId: number | undefined, notes: string): Observable<ApiResponse<string>> {
    return this._HttpClient.post<ApiResponse<string>>(
      `${this.apiUrl}/business-owners/approve`, { profileId, notes }
    );
  }

  rejectOwner(profileId: number | undefined, rejectionReason: string): Observable<ApiResponse<string>> {
    return this._HttpClient.post<ApiResponse<string>>(
      `${this.apiUrl}/business-owners/reject`, { profileId, rejectionReason }
    );
  }
}