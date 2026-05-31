import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse } from '../Interfaces/ibusiness-owner';

// ── Enums ─────────────────────────────────────────────────────────────────────

// status: 1=Pending 2=UnderReview 3=Resolved 4=Rejected
export const COMPLAINT_STATUS: Record<number, { label: string; badge: string }> = {
  1: { label: 'Pending',      badge: 'badge-pending'    },
  2: { label: 'Under Review', badge: 'badge-suspended'  },
  3: { label: 'Resolved',     badge: 'badge-active'     },
  4: { label: 'Rejected',     badge: 'badge-blocked'    },
};

// violationType: 1–7
export const VIOLATION_TYPE: Record<number, string> = {
  1: 'Fraud',
  2: 'Fake Product',
  3: 'Harassment',
  4: 'Spam',
  5: 'Counterfeit',
  6: 'Inappropriate Content',
  7: 'Other',
};

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface ComplaintListItem {
  id: number;
  reportedUserId: string;
  reportedUserName: string;
  reportedUserEmail: string;
  reportedByUserId: string;
  reportedByName: string;
  violationType: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  violationTypeText: string;
  description: string;
  status: 1 | 2 | 3 | 4;
  statusText: string;
  relatedOrderId: string | null;
  relatedProductId: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  resolution: string | null;
  adminNotes: string | null;
  createdAt: string;
}

export interface ComplaintFilterParams {
  reportedUserId?: string;
  status?: 1 | 2 | 3 | 4;
  violationType?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  pageIndex?: number;
  pageSize?: number;
}

export interface ResolveComplaintDto {
  complaintId: number;
  resolution: string;   // min 10 chars
  adminNotes?: string;
  blockUser: boolean;
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AdminComplaintService {

  private readonly apiUrl = '/api/admin/complaints';

  constructor(private _HttpClient: HttpClient) {}

  // GET /api/admin/complaints
  getComplaints(
    params?: ComplaintFilterParams
  ): Observable<ApiResponse<PaginatedResponse<ComplaintListItem>>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.reportedUserId) httpParams = httpParams.set('reportedUserId', params.reportedUserId);
      if (params.status)         httpParams = httpParams.set('status', params.status);
      if (params.violationType)  httpParams = httpParams.set('violationType', params.violationType);
      if (params.pageIndex)      httpParams = httpParams.set('pageIndex', params.pageIndex);
      if (params.pageSize)       httpParams = httpParams.set('pageSize', params.pageSize);
    }
    return this._HttpClient.get<ApiResponse<PaginatedResponse<ComplaintListItem>>>(
      this.apiUrl, { params: httpParams }
    );
  }

  // POST /api/admin/complaints/resolve
  resolveComplaint(dto: ResolveComplaintDto): Observable<ApiResponse<string>> {
    return this._HttpClient.post<ApiResponse<string>>(
      `${this.apiUrl}/resolve`, dto
    );
  }

  // POST /api/admin/complaints/{id}/reject
  rejectComplaint(id: number, reason: string): Observable<ApiResponse<string>> {
    return this._HttpClient.post<ApiResponse<string>>(
      `${this.apiUrl}/${id}/reject`, JSON.stringify(reason),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
}