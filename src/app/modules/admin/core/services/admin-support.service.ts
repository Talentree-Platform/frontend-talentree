import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse } from '../Interfaces/ibusiness-owner';

// ── Enums ─────────────────────────────────────────────────────────────────────

// status: 1=Open 2=InProgress 3=WaitingForUser 4=Resolved 5=Closed
export const TICKET_STATUS: Record<number, { label: string; badge: string; enumValue: string }> = {
  1: { label: 'Open',             badge: 'badge-pending',   enumValue: 'Open'           },
  2: { label: 'In Progress',      badge: 'badge-suspended', enumValue: 'InProgress'     },
  3: { label: 'Waiting for User', badge: 'badge-blocked',   enumValue: 'WaitingForUser' },
  4: { label: 'Resolved',         badge: 'badge-active',    enumValue: 'Resolved'       },
  5: { label: 'Closed',           badge: 'badge-closed',    enumValue: 'Closed'         },
};

// priority: 1=Low 2=Medium 3=High 4=Critical
export const TICKET_PRIORITY: Record<number, { label: string; badge: string }> = {
  1: { label: 'Low',      badge: 'priority-low'      },
  2: { label: 'Medium',   badge: 'priority-medium'   },
  3: { label: 'High',     badge: 'priority-high'     },
  4: { label: 'Critical', badge: 'priority-critical' },
};

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface SupportTicketListItem {
  id: number;
  ticketNumber: string;
  subject: string;
  category: number;
  categoryText: string;
  status: 1 | 2 | 3 | 4 | 5;
  statusText: string;
  priority: 1 | 2 | 3 | 4;
  priorityText: string;
  messageCount: number;
  hasUnreadMessages: boolean;
  createdAt: string;
  updatedAt: string;
  timeAgo: string;
}

export interface TicketFilterParams {
  status?: 1 | 2 | 3 | 4 | 5;
  priority?: 1 | 2 | 3 | 4;
  assignedToAdminId?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface UpdateTicketStatusDto {
  ticketId: number;
  status: number | string;
  note?: string;
}

export interface AssignTicketDto {
  ticketId: number;
  adminId: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AdminSupportService {

  private readonly apiUrl = 'https://backtalentree.runasp.net/api/admin/support/tickets';

  constructor(private _HttpClient: HttpClient) {}

  // GET /api/admin/support/tickets
  getTickets(
    params?: TicketFilterParams
  ): Observable<ApiResponse<PaginatedResponse<SupportTicketListItem>>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.status)            httpParams = httpParams.set('status', params.status);
      if (params.priority)          httpParams = httpParams.set('priority', params.priority);
      if (params.assignedToAdminId) httpParams = httpParams.set('assignedToAdminId', params.assignedToAdminId);
      if (params.pageIndex)         httpParams = httpParams.set('pageIndex', params.pageIndex);
      if (params.pageSize)          httpParams = httpParams.set('pageSize', params.pageSize);
    }
    return this._HttpClient.get<ApiResponse<PaginatedResponse<SupportTicketListItem>>>(
      this.apiUrl, { params: httpParams }
    );
  }

  // PUT /api/admin/support/tickets/status
  updateTicketStatus(dto: UpdateTicketStatusDto): Observable<ApiResponse<string>> {
    return this._HttpClient.put<ApiResponse<string>>(
      `${this.apiUrl}/status`, dto
    );
  }

  // PUT /api/admin/support/tickets/assign
  assignTicket(dto: AssignTicketDto): Observable<ApiResponse<string>> {
    return this._HttpClient.put<ApiResponse<string>>(
      `${this.apiUrl}/assign`, dto
    );
  }

  // PUT /api/admin/support/tickets/{id}/priority
  updateTicketPriority(id: number, priority: 1 | 2 | 3 | 4): Observable<ApiResponse<string>> {
    return this._HttpClient.put<ApiResponse<string>>(
      `${this.apiUrl}/${id}/priority`,
      priority,
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
}