import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Subscription, finalize } from 'rxjs';
import {
  NotificationService,
  Notification,
  NotificationPreferences,
  PagedList,
  NOTIFICATION_TYPE_MAP,
  PRIORITY_MAP,
} from '../../core/services/notification.service';

type ActiveTab = 'list' | 'preferences';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
})
export class NotificationComponent implements OnInit, OnDestroy {
  // ─── State ────────────────────────────────────────────────────────────────
  notifications: Notification[] = [];
  totalCount = 0;
  totalPages = 1;
  hasPrevious = false;
  hasNext = false;
  unreadCount = 0;

  pageIndex = 1;
  pageSize = 20;
  selectedType: number | undefined = undefined;
  selectedIsRead: boolean | undefined = undefined;

  loading = false;
  actionLoading = false;
  prefsLoading = false;
  prefsSaving = false;
  errorMsg = '';
  successMsg = '';

  activeTab: ActiveTab = 'list';
  preferences: NotificationPreferences | null = null;
  prefsForm: FormGroup;

  typeMap = NOTIFICATION_TYPE_MAP;
  typeKeys = Object.keys(NOTIFICATION_TYPE_MAP).map(Number);
  priorityMap = PRIORITY_MAP;

  private subs = new Subscription();

  constructor(
    private service: NotificationService,
    private fb: FormBuilder
  ) {
    this.prefsForm = this.fb.group({
      enableSystemNotifications: [true],
      enableOrderNotifications: [true],
      enableFinancialNotifications: [true],
      enableSupportNotifications: [true],
      enableProductNotifications: [true],
      emailSystemNotifications: [false],
      emailOrderNotifications: [false],
      emailFinancialNotifications: [false],
      emailSupportNotifications: [false],
      emailProductNotifications: [false],
      enableRealTimeNotifications: [true],
      enableQuietHours: [false],
      quietHoursStart: ['22:00'],
      quietHoursEnd: ['08:00'],
      notificationSound: ['default'],
      enableSound: [true],
    });
  }

  ngOnInit(): void {
    this.loadNotifications();
    this.loadUnreadCount();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // ─── Data Loading ─────────────────────────────────────────────────────────

  loadNotifications(silent = false): void {
    if (!silent) { this.loading = true; this.errorMsg = ''; }
    const sub = this.service
      .getAll(this.selectedType, this.selectedIsRead, this.pageIndex, this.pageSize)
      .pipe(finalize(() => { if (!silent) this.loading = false; }))
      .subscribe({
        next: (res) => {
          const page = this.extractPage(res.data);
          this.notifications = page?.data ?? [];
          this.totalCount    = page?.count ?? 0;
          this.totalPages    = page?.totalPages ?? 1;
          this.hasPrevious   = page?.hasPrevious ?? false;
          this.hasNext       = page?.hasNext ?? false;
        },
        error: (err) => {
          this.errorMsg = err?.error?.message || 'Failed to load notifications.';
        },
      });
    this.subs.add(sub);
  }

  loadUnreadCount(): void {
    this.service.getUnreadCount().subscribe({
      next: (count) => (this.unreadCount = count),
      error: () => {},
    });
  }

  loadPreferences(): void {
    this.prefsLoading = true;
    this.service.getPreferences()
      .pipe(finalize(() => (this.prefsLoading = false)))
      .subscribe({
        next: (prefs) => {
          this.preferences = prefs;
          this.prefsForm.patchValue(prefs);
        },
        error: (err) => {
          this.errorMsg = err?.error?.message || 'Failed to load preferences.';
        },
      });
  }

  private extractPage(resData: unknown): PagedList<Notification> | null {
    if (resData == null || typeof resData !== 'object') return null;
    const o = resData as Record<string, unknown>;
    if (Array.isArray(o['data']) && ('count' in o || 'pageIndex' in o)) {
      return o as unknown as PagedList<Notification>;
    }
    const inner = o['data'];
    if (inner != null && typeof inner === 'object' && !Array.isArray(inner)) {
      const i = inner as Record<string, unknown>;
      if (Array.isArray(i['data']) && ('count' in i || 'pageIndex' in i)) {
        return i as unknown as PagedList<Notification>;
      }
    }
    return null;
  }

  // ─── Filters & Pagination ─────────────────────────────────────────────────

  onTypeFilter(value: string): void {
    this.selectedType = value === '' ? undefined : Number(value);
    this.pageIndex = 1;
    this.loadNotifications();
  }

  onReadFilter(value: string): void {
    this.selectedIsRead = value === '' ? undefined : value === 'true';
    this.pageIndex = 1;
    this.loadNotifications();
  }

  onPageChange(dir: number): void {
    this.pageIndex = Math.max(1, Math.min(this.totalPages, this.pageIndex + dir));
    this.loadNotifications();
  }

  trackById(_: number, n: Notification): number { return n.id; }

  // ─── Actions ──────────────────────────────────────────────────────────────

  markAsRead(n: Notification): void {
    if (n.isRead) return;
    this.service.markAsRead(n.id).subscribe({
      next: () => {
        n.isRead = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      },
      error: () => {},
    });
  }

  markAllAsRead(): void {
    this.actionLoading = true;
    this.service.markAllAsRead()
      .pipe(finalize(() => (this.actionLoading = false)))
      .subscribe({
        next: () => {
          this.notifications.forEach((n) => (n.isRead = true));
          this.unreadCount = 0;
          this.successMsg = 'All notifications marked as read.';
        },
        error: (err) => {
          this.errorMsg = err?.error?.message || 'Failed to mark all as read.';
        },
      });
  }

  deleteNotification(n: Notification): void {
    this.service.delete(n.id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter((x) => x.id !== n.id);
        this.totalCount = Math.max(0, this.totalCount - 1);
        if (!n.isRead) this.unreadCount = Math.max(0, this.unreadCount - 1);
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Failed to delete notification.';
      },
    });
  }

  clearRead(): void {
    this.actionLoading = true;
    this.service.clearRead()
      .pipe(finalize(() => (this.actionLoading = false)))
      .subscribe({
        next: () => {
          this.successMsg = 'Read notifications cleared.';
          this.loadNotifications(true);
        },
        error: (err) => {
          this.errorMsg = err?.error?.message || 'Failed to clear read notifications.';
        },
      });
  }

  // ─── Preferences ──────────────────────────────────────────────────────────

  switchTab(tab: ActiveTab): void {
    this.activeTab = tab;
    this.clearMessages();
    if (tab === 'preferences' && !this.preferences) {
      this.loadPreferences();
    }
  }

  savePreferences(): void {
    if (this.prefsForm.invalid) return;
    this.prefsSaving = true;
    this.service.updatePreferences(this.prefsForm.value)
      .pipe(finalize(() => (this.prefsSaving = false)))
      .subscribe({
        next: (saved) => {
          this.preferences = saved;
          this.successMsg = 'Preferences saved successfully.';
        },
        error: (err) => {
          this.errorMsg = err?.error?.message || 'Failed to save preferences.';
        },
      });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  getTypeLabel(type: number): string { return this.typeMap[type]?.label ?? 'Unknown'; }
  getTypeColor(type: number): string { return this.typeMap[type]?.color ?? '#6b7280'; }
  getTypeBg(type: number): string    { return this.typeMap[type]?.bg ?? '#f3f4f6'; }
  getPriorityLabel(p: number): string { return this.priorityMap[p]?.label ?? 'Normal'; }
  getPriorityColor(p: number): string { return this.priorityMap[p]?.color ?? '#6b7280'; }

  clearMessages(): void { this.errorMsg = ''; this.successMsg = ''; }
}