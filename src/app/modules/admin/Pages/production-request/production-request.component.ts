import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Subscription, finalize } from 'rxjs';
import {
  ProductionRequestService,
  ProductionRequest,
  PagedList,
  STATUS_MAP,
} from '../../services/production-request.service';

type ModalMode = 'quote' | 'complete' | 'reject' | 'detail' | null;

@Component({
  selector: 'app-production-request',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './production-request.component.html',
  styleUrls: ['./production-request.component.css'],
})
export class ProductionRequestComponent implements OnInit, OnDestroy {
  requests: ProductionRequest[] = [];
  totalCount = 0;
  pageIndex = 1;
  pageSize = 20;
  selectedStatus: number | undefined = undefined;

  private requestVersion = 0;
  private loadRequestsSub?: Subscription;

  loading = false;
  actionLoading = false;
  startLoadingId: number | null = null;
  errorMsg = '';
  successMsg = '';

  selectedRequest: ProductionRequest | null = null;
  modalMode: ModalMode = null;

  statusMap = STATUS_MAP;
  statusKeys = Object.keys(STATUS_MAP).map(Number);

  quoteForm: FormGroup;
  completeForm: FormGroup;
  rejectForm: FormGroup;

  constructor(
    private service: ProductionRequestService,
    private fb: FormBuilder
  ) {
    this.quoteForm = this.fb.group({
      quotedPrice: [null, [Validators.required, Validators.min(0.01)]],
      estimatedCompletionDate: ['', Validators.required],
      adminNotes: [''],
    });
    this.completeForm = this.fb.group({ adminNotes: [''] });
    this.rejectForm = this.fb.group({ reason: ['', Validators.required] });
  }

  ngOnInit(): void {
    this.loadRequests();
  }

  ngOnDestroy(): void {
    this.loadRequestsSub?.unsubscribe();
  }

  // ─── Data Loading ────────────────────────────────────────────────────────────

  loadRequests(options?: { silent?: boolean }): void {
    const silent = options?.silent ?? false;
    const version = ++this.requestVersion;
    this.loadRequestsSub?.unsubscribe();

    if (!silent) {
      this.loading = true;
      this.errorMsg = '';
    }

    this.loadRequestsSub = this.service
      .getAll(this.selectedStatus, this.pageIndex, this.pageSize)
      .pipe(finalize(() => { if (version === this.requestVersion && !silent) this.loading = false; }))
      .subscribe({
        next: (res) => {
          if (version !== this.requestVersion) return;
          const page = this.extractPagedList(res.data);
          this.requests = Array.isArray(page?.data)
            ? this.coerceRequestList(page!.data)
            : [];
          this.totalCount = page?.count ?? 0;
          this.syncSelectedRequestFromList();
        },
        error: (err) => {
          if (version !== this.requestVersion) return;
          this.errorMsg = err?.error?.message || 'Failed to load requests.';
        },
      });
  }

  /**
   * Handles both shapes:
   *   Shape A — res.data IS PagedList: { pageIndex, count, data: [] }
   *   Shape B — res.data is double-wrapped: { data: { pageIndex, count, data: [] } }
   */
  private extractPagedList(resData: unknown): PagedList<ProductionRequest> | null {
    if (resData == null || typeof resData !== 'object') return null;
    const o = resData as Record<string, unknown>;

    // Shape A: direct PagedList
    if (Array.isArray(o['data']) && ('count' in o || 'pageIndex' in o)) {
      return o as unknown as PagedList<ProductionRequest>;
    }

    // Shape B: double-wrapped
    const inner = o['data'];
    if (inner != null && typeof inner === 'object' && !Array.isArray(inner)) {
      const i = inner as Record<string, unknown>;
      if (Array.isArray(i['data']) && ('count' in i || 'pageIndex' in i)) {
        return i as unknown as PagedList<ProductionRequest>;
      }
    }

    // Shape C: shell with no data array — empty page
    if ('count' in o || 'pageIndex' in o) {
      return { pageIndex: 1, pageSize: this.pageSize, count: 0, data: [] };
    }

    console.warn('[extractPagedList] unrecognized shape:', resData);
    return null;
  }

  private coerceRequestList(raw: unknown[]): ProductionRequest[] {
    return raw
      .map((item) => this.normalizeRow(item))
      .filter((r): r is ProductionRequest => r !== null);
  }

  private normalizeRow(item: unknown): ProductionRequest | null {
    if (item == null || typeof item !== 'object') return null;
    const o = item as Record<string, unknown>;
    const id = typeof o['id'] === 'number' ? o['id'] : Number(o['id']);
    if (!Number.isFinite(id)) return null;
    let status = o['status'];
    if (typeof status === 'string') status = Number(status);
    if (typeof status !== 'number' || Number.isNaN(status)) return null;
    return { ...o, id, status } as ProductionRequest;
  }

  private syncSelectedRequestFromList(): void {
    const id = this.selectedRequest?.id;
    if (id == null) return;
    this.selectedRequest = this.requests.find((r) => r.id === id) ?? null;
  }

  // ─── Optimistic Updates ───────────────────────────────────────────────────

  private optimisticApplyStatus(
    id: number,
    newStatus: number,
    patch: Partial<ProductionRequest>
  ): { snapshot: ProductionRequest; index: number } | null {
    const index = this.requests.findIndex((r) => r.id === id);
    if (index < 0) return null;
    const snapshot = { ...this.requests[index] };
    const removeFromView = this.selectedStatus !== undefined && this.selectedStatus !== newStatus;

    if (removeFromView) {
      this.requests = this.requests.filter((r) => r.id !== id);
      this.totalCount = Math.max(0, this.totalCount - 1);
    } else {
      this.requests = this.requests.map((r) =>
        r.id === id ? { ...r, ...patch, status: newStatus } : r
      );
    }
    this.syncSelectedRequestFromList();
    return { snapshot, index };
  }

  private rollbackOptimistic(state: { snapshot: ProductionRequest; index: number }): void {
    const { snapshot, index } = state;
    const stillPresent = this.requests.some((r) => r.id === snapshot.id);
    if (!stillPresent) {
      const next = [...this.requests];
      next.splice(Math.min(Math.max(0, index), next.length), 0, snapshot);
      this.requests = next;
      this.totalCount++;
    } else {
      this.requests = this.requests.map((r) => (r.id === snapshot.id ? snapshot : r));
    }
    this.syncSelectedRequestFromList();
  }

  // ─── Status Helpers ───────────────────────────────────────────────────────

  /**
   * Eligible to start when status = 2 (Quoted / Confirmed by backend).
   * Adjust the numeric value to match your backend's "confirmed" status code.
   */
  isStartEligible(req: ProductionRequest | null | undefined): req is ProductionRequest {
    return req != null && req.id != null && req.status === 3; // 3 = Confirmed (set by BO via /confirm)
  }

  getStatusLabel(status: number | null | undefined): string {
    if (status == null) return 'Unknown';
    return this.statusMap[status]?.label ?? 'Unknown';
  }

  getStatusColor(status: number | null | undefined): string {
    if (status == null) return '#6B7280';
    return this.statusMap[status]?.color ?? '#6B7280';
  }

  getStatusBg(status: number | null | undefined): string {
    if (status == null) return '#F3F4F6';
    return this.statusMap[status]?.bg ?? '#F3F4F6';
  }

  private getApiErrorMessage(err: unknown, fallback: string): string {
    const e = err as { error?: { message?: string; errors?: unknown[] }; message?: string };
    if (typeof e?.error?.message === 'string' && e.error.message.trim()) return e.error.message;
    if (Array.isArray(e?.error?.errors) && e.error!.errors!.length > 0) return String(e.error!.errors![0]);
    if (typeof e?.message === 'string' && e.message.trim()) return e.message;
    return fallback;
  }

  // ─── Filters & Pagination ────────────────────────────────────────────────

  onStatusFilter(value: string): void {
    const next = value === '' ? undefined : Number(value);
    if (next === this.selectedStatus && this.pageIndex === 1) return;
    this.selectedStatus = next;
    this.pageIndex = 1;
    this.loadRequests();
  }

  onPageChange(dir: number): void {
    this.pageIndex = Math.max(1, Math.min(this.totalPages, this.pageIndex + dir));
    this.loadRequests();
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize) || 1;
  }

  trackByRequestId(_index: number, req: ProductionRequest): number {
    return req.id;
  }

  // ─── Modal Controls ──────────────────────────────────────────────────────

  openDetail(req: ProductionRequest): void {
    if (req?.id == null) return;
    this.loading = true;
    this.service.getById(req.id).subscribe({
      next: (full) => {
        this.selectedRequest = full ?? req;
        this.modalMode = 'detail';
        this.loading = false;
      },
      error: () => {
        this.selectedRequest = req;
        this.modalMode = 'detail';
        this.loading = false;
      },
    });
  }

  openModal(mode: ModalMode, req: ProductionRequest): void {
    if (req?.id == null) return;
    this.selectedRequest = req;
    this.modalMode = mode;
    this.clearMessages();
    if (mode === 'quote') this.quoteForm.reset();
    if (mode === 'complete') this.completeForm.reset();
    if (mode === 'reject') this.rejectForm.reset();
  }

  closeModal(clearAlerts = true, force = false): void {
    if (!force && (this.actionLoading || this.startLoadingId != null)) return;
    this.modalMode = null;
    this.selectedRequest = null;
    if (clearAlerts) this.clearMessages();
  }

  clearMessages(): void {
    this.errorMsg = '';
    this.successMsg = '';
  }

  detailEntries(): { key: string; value: unknown }[] {
    if (!this.selectedRequest) return [];
    return Object.entries(this.selectedRequest)
      .filter(([k]) => k !== 'id')
      .map(([key, value]) => ({ key, value }));
  }

  // ─── Actions ─────────────────────────────────────────────────────────────

  doReview(req: ProductionRequest): void {
    if (req?.id == null) return;
    this.actionLoading = true;
    this.service.review(req.id).subscribe({
      next: () => {
        this.actionLoading = false;
        this.successMsg = `Request #${req.id} marked as Reviewed.`;
        this.loadRequests({ silent: true });
      },
      error: (err) => {
        this.errorMsg = this.getApiErrorMessage(err, 'Review action failed.');
        this.actionLoading = false;
      },
    });
  }

  doStart(req: ProductionRequest): void {
    if (this.startLoadingId != null) return;
    if (!this.isStartEligible(req)) {
      this.errorMsg = 'This request must be Quoted before starting production.';
      return;
    }
    this.loadRequestsSub?.unsubscribe();
    this.loading = false;
    const rollback = this.optimisticApplyStatus(req.id, 4, {});
    if (!rollback) { this.errorMsg = 'Could not update the request.'; return; }
    this.errorMsg = '';
    this.startLoadingId = req.id;
    this.service.start(req.id).subscribe({
      next: () => {
        this.startLoadingId = null;
        this.successMsg = `Request #${req.id} started.`;
      },
      error: (err) => {
        this.rollbackOptimistic(rollback);
        this.errorMsg = this.getApiErrorMessage(err, 'Start action failed.');
        this.startLoadingId = null;
      },
    });
  }

  submitQuote(): void {
    if (this.quoteForm.invalid || !this.selectedRequest?.id) return;
    const id = this.selectedRequest.id;
    this.actionLoading = true;
    this.service.quote(id, this.quoteForm.value).subscribe({
      next: () => {
        this.actionLoading = false;
        this.closeModal(false, true);
        this.successMsg = `Quote submitted for Request #${id}.`;
        this.loadRequests({ silent: true });
      },
      error: (err) => {
        this.errorMsg = this.getApiErrorMessage(err, 'Quote submission failed.');
        this.actionLoading = false;
      },
    });
  }

  submitComplete(): void {
    if (this.actionLoading || !this.selectedRequest?.id) return;
    if (this.completeForm.invalid) { this.completeForm.markAllAsTouched(); return; }
    const id = this.selectedRequest.id;
    const payload = { adminNotes: String(this.completeForm.value.adminNotes ?? '') };

    this.loadRequestsSub?.unsubscribe();
    this.loading = false;
    const rollback = this.optimisticApplyStatus(id, 5, payload);
    if (!rollback) { this.errorMsg = 'Could not update the request.'; return; }

    this.actionLoading = true;
    this.errorMsg = '';
    this.service.complete(id, payload)
      .pipe(finalize(() => (this.actionLoading = false)))
      .subscribe({
        next: () => {
          this.syncSelectedRequestFromList();
          this.successMsg = `Request #${id} completed.`;
          this.closeModal(false, true);
        },
        error: (err) => {
          this.rollbackOptimistic(rollback);
          this.errorMsg = this.getApiErrorMessage(err, 'Complete action failed.');
        },
      });
  }

  submitReject(): void {
    if (this.actionLoading || !this.selectedRequest?.id) return;
    if (this.rejectForm.invalid) { this.rejectForm.markAllAsTouched(); return; }
    const id = this.selectedRequest.id;
    const reason = String(this.rejectForm.value.reason ?? '');

    this.loadRequestsSub?.unsubscribe();
    this.loading = false;
    const rollback = this.optimisticApplyStatus(id, 6, { rejectionReason: reason });
    if (!rollback) { this.errorMsg = 'Could not update the request.'; return; }

    this.actionLoading = true;
    this.errorMsg = '';
    this.service.reject(id, { reason })
      .pipe(finalize(() => (this.actionLoading = false)))
      .subscribe({
        next: () => {
          this.syncSelectedRequestFromList();
          this.successMsg = `Request #${id} rejected.`;
          this.closeModal(false, true);
        },
        error: (err) => {
          this.rollbackOptimistic(rollback);
          this.errorMsg = this.getApiErrorMessage(err, 'Reject action failed.');
        },
      });
  }
}