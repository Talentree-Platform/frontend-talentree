import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  AdminRefundsService,
  RefundRequestDto,
  REFUND_STATUS_MAP,
} from '../../core/services/admin-refunds.service';

@Component({
  selector: 'app-admin-refunds',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-refunds.component.html',
  styleUrls: ['./admin-refunds.component.css'],
})
export class AdminRefundsComponent implements OnInit, OnDestroy {
  refunds: RefundRequestDto[] = [];
  totalCount = 0;
  pageIndex = 1;
  pageSize = 20;
  selectedStatus: number | undefined = undefined;

  loading = false;
  actionLoadingId: number | null = null;
  errorMsg = '';
  successMsg = '';

  statusMap = REFUND_STATUS_MAP;
  statusKeys = Object.keys(REFUND_STATUS_MAP).map(Number);

  selectedRefund: RefundRequestDto | null = null;
  showDetailModal = false;

  private sub?: Subscription;

  constructor(private service: AdminRefundsService) {}

  ngOnInit(): void {
    this.loadRefunds();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  // ─── Data Loading ───────────────────────────────────────────────────────────

  loadRefunds(silent = false): void {
    this.sub?.unsubscribe();
    if (!silent) {
      this.loading = true;
      this.errorMsg = '';
    }

    this.sub = this.service.getRefunds(this.selectedStatus, this.pageIndex, this.pageSize).subscribe({
      next: (res) => {
        this.loading = false;
        // API returns a PagedList directly — any successful HTTP 2xx is a valid response.
        // An empty data array is NOT an error; treat it as "no refunds yet".
        this.refunds = res?.data ?? [];
        this.totalCount = res?.count ?? 0;
      },
      error: (err) => {
        this.loading = false;
        // Only show the error banner for actual HTTP failures or runtime errors.
        this.errorMsg = err?.error?.message ?? err?.message ?? 'An error occurred while loading refunds.';
      },
    });
  }

  // ─── Filters / Pagination ───────────────────────────────────────────────────

  onStatusChange(): void {
    this.pageIndex = 1;
    this.loadRefunds();
  }

  prevPage(): void {
    if (this.pageIndex > 1) {
      this.pageIndex--;
      this.loadRefunds();
    }
  }

  nextPage(): void {
    if (this.pageIndex < this.totalPages) {
      this.pageIndex++;
      this.loadRefunds();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize) || 1;
  }

  // ─── Actions ────────────────────────────────────────────────────────────────

  approveRefund(refund: RefundRequestDto): void {
    this.clearMessages();
    this.actionLoadingId = refund.id;

    this.service.approveRefund(refund.id).subscribe({
      next: () => {
        this.actionLoadingId = null;
        this.successMsg = `Refund #${refund.id} approved successfully.`;
        this.loadRefunds(true);
      },
      error: (err) => {
        this.actionLoadingId = null;
        this.errorMsg = err?.error?.message ?? 'Error approving refund.';
      },
    });
  }

  rejectRefund(refund: RefundRequestDto): void {
    this.clearMessages();
    this.actionLoadingId = refund.id;

    this.service.rejectRefund(refund.id).subscribe({
      next: () => {
        this.actionLoadingId = null;
        this.successMsg = `Refund #${refund.id} rejected.`;
        this.loadRefunds(true);
      },
      error: (err) => {
        this.actionLoadingId = null;
        this.errorMsg = err?.error?.message ?? 'Error rejecting refund.';
      },
    });
  }

  // ─── Detail Modal ────────────────────────────────────────────────────────────

  openDetail(refund: RefundRequestDto): void {
    this.selectedRefund = refund;
    this.showDetailModal = true;
  }

  closeDetail(): void {
    this.selectedRefund = null;
    this.showDetailModal = false;
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  getStatusLabel(status: number): string {
    return this.statusMap[status]?.label ?? 'Unknown';
  }

  getStatusColor(status: number): string {
    return this.statusMap[status]?.color ?? '#374151';
  }

  getStatusBg(status: number): string {
    return this.statusMap[status]?.bg ?? '#f3f4f6';
  }

  isPending(refund: RefundRequestDto): boolean {
    return refund.status === 0;
  }

  clearMessages(): void {
    this.errorMsg = '';
    this.successMsg = '';
  }

  get pageStart(): number {
    return this.totalCount === 0 ? 0 : (this.pageIndex - 1) * this.pageSize + 1;
  }

  get pageEnd(): number {
    return Math.min(this.pageIndex * this.pageSize, this.totalCount);
  }
}
