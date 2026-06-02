import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse } from '../Interfaces/ibusiness-owner';

// ── Enums ─────────────────────────────────────────────────────────────────────

export const TICKET_STATUS: Record<number, { label: string; badge: string; enumValue: string }> = {
  1: { label: 'Open',             badge: 'badge-pending',   enumValue: 'Open'           },
  2: { label: 'In Progress',      badge: 'badge-suspended', enumValue: 'InProgress'     },
  3: { label: 'Waiting for User', badge: 'badge-blocked',   enumValue: 'WaitingForUser' },
  4: { label: 'Resolved',         badge: 'badge-active',    enumValue: 'Resolved'       },
  5: { label: 'Closed',           badge: 'badge-closed',    enumValue: 'Closed'         },
};

export const TICKET_PRIORITY: Record<number, { label: string; badge: string }> = {
  1: { label: 'Low',      badge: 'priority-low'      },
  2: { label: 'Medium',   badge: 'priority-medium'   },
  3: { label: 'High',     badge: 'priority-high'     },
  4: { label: 'Critical', badge: 'priority-critical' },
};

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface TicketAttachment {
  id: number;
  fileName: string;
  fileUrl: string;
  fileSizeBytes: number;
  fileSizeMB: string;
  contentType: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface TicketMessage {
  id: number;
  ticketId: number;
  senderId: string;
  senderName: string;
  isAdminMessage: boolean;   // ← الاسم الصح من الـ API
  content: string;           // ← الاسم الصح من الـ API (مش message)
  attachments: TicketAttachment[];
  createdAt: string;
  timeAgo: string;
}

export interface TicketDetails {
  id: number;
  ticketNumber: string;
  subject: string;
  description: string;
  category: number;
  categoryText: string;
  status: 1 | 2 | 3 | 4 | 5;
  statusText: string;
  priority: 1 | 2 | 3 | 4;
  priorityText: string;
  businessOwnerUserId: string;
  businessOwnerName: string;
  businessOwnerEmail: string;
  assignedToAdminId: string;
  assignedAt: string;
  resolvedAt: string;
  resolvedBy: string;
  closedAt: string;
  closedBy: string;
  messageCount: number;
  attachmentCount: number;
  attachments: TicketAttachment[];
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
  timeAgo: string;
}

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
  getTickets(params?: TicketFilterParams): Observable<ApiResponse<PaginatedResponse<SupportTicketListItem>>> {
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

  // GET /api/admin/support/tickets/{id}  ← messages موجودة جوه الـ response
  getTicketById(id: number): Observable<ApiResponse<TicketDetails>> {
    return this._HttpClient.get<ApiResponse<TicketDetails>>(`${this.apiUrl}/${id}`);
  }

  // POST /api/admin/support/tickets/messages  ← multipart/form-data
  sendMessage(ticketId: number, content: string, attachments?: File[]): Observable<ApiResponse<TicketMessage>> {
    const formData = new FormData();
    formData.append('TicketId', ticketId.toString());
    formData.append('Content', content);
    if (attachments?.length) {
      attachments.forEach(file => formData.append('Attachments', file));
    }
    return this._HttpClient.post<ApiResponse<TicketMessage>>(
      `${this.apiUrl}/messages`, formData
    );
  }

  // PUT /api/admin/support/tickets/status
  updateTicketStatus(dto: UpdateTicketStatusDto): Observable<ApiResponse<string>> {
    return this._HttpClient.put<ApiResponse<string>>(`${this.apiUrl}/status`, dto);
  }

  // PUT /api/admin/support/tickets/assign
  assignTicket(dto: AssignTicketDto): Observable<ApiResponse<string>> {
    return this._HttpClient.put<ApiResponse<string>>(`${this.apiUrl}/assign`, dto);
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