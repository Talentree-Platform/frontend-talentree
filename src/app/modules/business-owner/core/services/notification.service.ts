import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Notification {
  id: number;
  type: number;
  typeText: string;
  title: string;
  message: string;
  actionUrl?: string | null;
  actionText?: string | null;
  relatedEntityType?: string | null;
  relatedEntityId?: number | null;
  isRead: boolean;
  readAt?: string | null;
  priority: number;
  priorityText: string;
  createdAt: string;
  timeAgo: string;
}

export interface NotificationPreferences {
  enableSystemNotifications: boolean;
  enableOrderNotifications: boolean;
  enableFinancialNotifications: boolean;
  enableSupportNotifications: boolean;
  enableProductNotifications: boolean;
  emailSystemNotifications: boolean;
  emailOrderNotifications: boolean;
  emailFinancialNotifications: boolean;
  emailSupportNotifications: boolean;
  emailProductNotifications: boolean;
  enableRealTimeNotifications: boolean;
  enableQuietHours: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  notificationSound: string;
  enableSound: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
  errors: string[];
  timestamp: string;
}

export interface PagedList<T> {
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

export const NOTIFICATION_TYPE_MAP: Record<number, { label: string; icon: string; color: string; bg: string }> = {
  1: { label: 'System',    icon: 'system',    color: '#1e4fa3', bg: '#dbeafe' },
  2: { label: 'Order',     icon: 'order',     color: '#92680a', bg: '#fef3c7' },
  3: { label: 'Financial', icon: 'financial', color: '#166534', bg: '#dcfce7' },
  4: { label: 'Support',   icon: 'support',   color: '#6b21a8', bg: '#f3e8ff' },
  5: { label: 'Product',   icon: 'product',   color: '#0e7490', bg: '#cffafe' },
};

export const PRIORITY_MAP: Record<number, { label: string; color: string }> = {
  1: { label: 'Low',      color: '#6b7280' },
  2: { label: 'Normal',   color: '#1e4fa3' },
  3: { label: 'High',     color: '#d97706' },
  4: { label: 'Critical', color: '#991b1b' },
};

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly base = 'https://backtalentree.runasp.net/api/Notification';

  constructor(private http: HttpClient) {}

  getAll(
    type?: number,
    isRead?: boolean,
    pageIndex = 1,
    pageSize = 20
  ): Observable<ApiResponse<PagedList<Notification>>> {
    let params = new HttpParams()
      .set('pageIndex', String(pageIndex))
      .set('pageSize', String(pageSize));
    if (type !== undefined) params = params.set('type', String(type));
    if (isRead !== undefined) params = params.set('isRead', String(isRead));
    return this.http.get<ApiResponse<PagedList<Notification>>>(this.base, { params });
  }

  getUnreadCount(): Observable<number> {
    return this.http
      .get<ApiResponse<number>>(`${this.base}/unread-count`)
      .pipe(map((res) => res.data ?? 0));
  }

  getById(id: number): Observable<Notification> {
    return this.http
      .get<ApiResponse<Notification>>(`${this.base}/${id}`)
      .pipe(map((res) => res.data));
  }

  markAsRead(id: number): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(`${this.base}/${id}/mark-as-read`, {});
  }

  markAllAsRead(): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(`${this.base}/mark-all-as-read`, {});
  }

  delete(id: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.base}/${id}`);
  }

  clearRead(): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.base}/clear-read`);
  }

  getPreferences(): Observable<NotificationPreferences> {
    return this.http
      .get<ApiResponse<NotificationPreferences>>(`${this.base}/preferences`)
      .pipe(map((res) => res.data));
  }

  updatePreferences(prefs: NotificationPreferences): Observable<NotificationPreferences> {
    return this.http
      .put<ApiResponse<NotificationPreferences>>(`${this.base}/preferences`, prefs)
      .pipe(map((res) => res.data));
  }
}