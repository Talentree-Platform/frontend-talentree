import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { AdminInteractionService } from '../../../core/services/admin-interaction.service';
import { PaginationComponent } from '../../../Components/pagination/pagination.component';
import {
  InteractionItem,
  InteractionFilterParams,
  InteractionExportParams,
} from '../../../core/Interfaces/iinteractions';

type SortableField = 'id' | 'actionType' | 'itemType' | 'category' | 'quantity' | 'price' | 'interactionTimestamp';

@Component({
  selector: 'app-admin-interactions',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './admin-interactions.component.html',
  styleUrl: './admin-interactions.component.css',
})
export class AdminInteractionsComponent implements OnDestroy {

  constructor(
    private _InteractionService: AdminInteractionService,
    private _ToastrService: ToastrService,
  ) { }

  private destroy$ = new Subject<void>();

  // ── Search state ─────────────────────────────────────────────────────────
  // NOTE: There is no "list all interactions" endpoint — the backend only
  // exposes GET /api/admin/interactions/{userId}, so a User ID is required
  // before any data can be loaded.
  userIdInput = '';
  searchedUserId: string | null = null;
  hasSearched = false;

  // ── Data ─────────────────────────────────────────────────────────────────
  interactions: InteractionItem[] = [];
  isLoading = false;

  // ── Pagination (values come directly from the API response) ─────────────
  pageIndex = 1;
  pageSize = 0;
  totalPages = 0;
  totalCount = 0;
  hasNext = false;
  hasPrevious = false;

  // ── Sorting ──────────────────────────────────────────────────────────────
  // The backend does not document a sort param for this endpoint, so sorting
  // is applied client-side on the currently loaded page of results.
  sortBy: SortableField = 'interactionTimestamp';
  sortDesc = true;

  // ── Export ───────────────────────────────────────────────────────────────
  exportFromDate = '';
  exportToDate = '';
  exportLoading = false;

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Search / Load ────────────────────────────────────────────────────────
  search(): void {
    const id = this.userIdInput.trim();
    if (!id) {
      this._ToastrService.error('Please enter a User ID to search.', 'Talentree', { timeOut: 2000, closeButton: true });
      return;
    }
    this.searchedUserId = id;
    this.pageIndex = 1;
    this.load();
  }

  refresh(): void {
    if (!this.searchedUserId) return;
    this.load();
  }

  clearSearch(): void {
    this.userIdInput = '';
    this.searchedUserId = null;
    this.hasSearched = false;
    this.interactions = [];
    this.pageIndex = 1;
    this.totalPages = 0;
    this.totalCount = 0;
    this.hasNext = false;
    this.hasPrevious = false;
  }

  private load(): void {
    if (!this.searchedUserId) return;
    this.isLoading = true;
    this.hasSearched = true;

    const params: InteractionFilterParams = { pageIndex: this.pageIndex };

    this._InteractionService.getUserInteractions(this.searchedUserId, params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.success) {
            this.interactions = res.data.data ?? [];
            this.pageSize = res.data.pageSize;
            this.totalPages = res.data.totalPages;
            this.totalCount = res.data.count;
            this.hasNext = res.data.hasNext;
            this.hasPrevious = res.data.hasPrevious;
            this.pageIndex = res.data.pageIndex;
            this.applySort();
          } else {
            this.interactions = [];
            this.totalCount = 0;
            this.totalPages = 0;
            this._ToastrService.error(
              res.message ?? 'Failed to load interactions.', 'Talentree',
              { timeOut: 2500, closeButton: true }
            );
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.interactions = [];
          // Treat "user has no interactions" (commonly surfaced as 404 by
          // some backends) as an empty result, not a hard error.
          if (err?.status === 404) {
            this.totalCount = 0;
            this.totalPages = 0;
          } else {
            this._ToastrService.error(
              err?.error?.message ?? 'Failed to load interactions for this user.',
              'Talentree', { timeOut: 2500, closeButton: true }
            );
          }
        },
      });
  }

  pageChangeEvent(page: number): void {
    this.pageIndex = page;
    this.load();
  }

  // ── Sorting (client-side on current page) ─────────────────────────────────
  toggleSort(field: SortableField): void {
    if (this.sortBy === field) {
      this.sortDesc = !this.sortDesc;
    } else {
      this.sortBy = field;
      this.sortDesc = true;
    }
    this.applySort();
  }

  private applySort(): void {
    const field = this.sortBy;
    const dir = this.sortDesc ? -1 : 1;
    this.interactions = [...this.interactions].sort((a, b) => {
      const av = a[field];
      const bv = b[field];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }

  // ── Export ───────────────────────────────────────────────────────────────
  exportInteractions(): void {
    this.exportLoading = true;
    const params: InteractionExportParams = {
      fromDate: this.exportFromDate || undefined,
      toDate: this.exportToDate || undefined,
    };

    this._InteractionService.exportInteractions(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.exportLoading = false;
          const blob = response.body as Blob;
          const contentType = response.headers.get('content-type') ?? '';
          const ext = this.extensionFromContentType(contentType);
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `interactions-export-${new Date().toISOString().slice(0, 10)}.${ext}`;
          a.click();
          window.URL.revokeObjectURL(url);
          this._ToastrService.success('Export downloaded!', 'Talentree', { timeOut: 2000, closeButton: true });
        },
        error: () => {
          this.exportLoading = false;
          this._ToastrService.error(
            'Export failed. Please try again.', 'Talentree',
            { timeOut: 2500, closeButton: true }
          );
        },
      });
  }

  private extensionFromContentType(ct: string): string {
    if (ct.includes('spreadsheet') || ct.includes('excel')) return 'xlsx';
    if (ct.includes('csv')) return 'csv';
    if (ct.includes('pdf')) return 'pdf';
    if (ct.includes('json')) return 'json';
    // Fallback: backend response schema for /export wasn't documented in
    // Swagger, so default to xlsx (matches the convention used by
    // AdminOrders' export endpoint). Confirm against a real response.
    return 'xlsx';
  }

  // ── UI Helpers ───────────────────────────────────────────────────────────
  formatDateTime(val: string | null | undefined): string {
    if (!val) return '—';
    return new Date(val).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  formatPrice(val: number | null | undefined): string {
    if (val == null) return '—';
    return '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Heuristic badge mapping — the backend doesn't expose a fixed enum for
  // actionType, so this groups common action-name patterns. Refine once
  // real actionType values are confirmed from production data.
  actionBadgeClass(action: string | null | undefined): string {
    const a = (action ?? '').toLowerCase();
    if (a.includes('purchase') || a.includes('buy') || a.includes('order')) return 'badge-active';
    if (a.includes('cart') || a.includes('add')) return 'badge-pending';
    if (a.includes('wishlist') || a.includes('favorite') || a.includes('like')) return 'badge-blocked';
    if (a.includes('view') || a.includes('click')) return 'badge-suspended';
    if (a.includes('remove') || a.includes('delete') || a.includes('cancel')) return 'badge-banned';
    return 'badge-closed';
  }

  // ── Derived stats ────────────────────────────────────────────────────────
  // IMPORTANT: these reflect only the currently loaded PAGE of results
  // (the API returns one page at a time), not the user's full history.
  get pageTotalValue(): number {
    return this.interactions.reduce((sum, i) => sum + (i.price ?? 0), 0);
  }

  get distinctActionTypesOnPage(): number {
    return new Set(this.interactions.map(i => i.actionType)).size;
  }

  get lastInteractionOnPage(): string | null {
    if (!this.interactions.length) return null;
    return this.interactions.reduce(
      (latest, i) => (new Date(i.interactionTimestamp) > new Date(latest) ? i.interactionTimestamp : latest),
      this.interactions[0].interactionTimestamp
    );
  }
}