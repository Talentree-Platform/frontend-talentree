import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProductionRequest } from '../../../core/interfaces/i-production-request';
import { BoProductionRequestService } from '../../../core/services/bo-production-request.service';
import { Router } from '@angular/router';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-production-request-list',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe],
  templateUrl: './production-request-list.component.html',
  styleUrl: './production-request-list.component.css'
})
export class ProductionRequestListComponent implements OnInit, OnDestroy {
  requests: ProductionRequest[] = [];
  totalPages: number = 0;
  totalCount: number = 0;

  // ── All-data stats (independent of current page) ────────────────────────
  private allRequests: ProductionRequest[] = [];

  loading: boolean = false;
  error: string = '';

  pageIndex: number = 1;
  pageSize: number = 10;

  // ── Toaster ──────────────────────────────────────────────────────────────
  toaster: { message: string; type: 'success' | 'error' } | null = null;
  private toasterTimer: any;

  // ── Cancel state ─────────────────────────────────────────────────────────
  cancellingId: number | null = null;
  confirmDeleteId: number | null = null;

  // ── Confirm state ─────────────────────────────────────────────────────────
  confirmingId: number | null = null;
  confirmDialogId: number | null = null;

  constructor(
    private productionRequestService: BoProductionRequestService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRequests();
    this.loadStats();
  }

  ngOnDestroy(): void {
    clearTimeout(this.toasterTimer);
  }

  loadRequests(): void {
    this.loading = true;
    this.error = '';

    this.productionRequestService.getAll(this.pageIndex, this.pageSize).subscribe({
      next: (response) => {
        this.requests = (response.data?.data ?? []).map(r => ({
          ...r,
          items: r.items ?? [],
          statusHistory: r.statusHistory ?? [],
        }));
        this.totalPages = response.data?.totalPages ?? 0;
        this.totalCount = response.data?.count ?? 0;
        this.loading = false;
      },
      error: (err: Error) => {
        this.error = err.message ?? 'An unexpected error occurred.';
        this.loading = false;
      },
    });
  }

  // Fetches the full (unpaginated) set of requests so the hero stats reflect
  // the business owner's whole history, not just the requests on this page.
  loadStats(): void {
    this.productionRequestService.getAll(1, 1000).subscribe({
      next: (response) => {
        this.allRequests = response.data?.data ?? [];
      },
      error: () => {
        this.allRequests = [];
      },
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.pageIndex = page;
    this.loadRequests();
  }

  navigateToDetails(id: number): void {
    this.router.navigate(['/businessowner/ownerProductionRequestdetails', id]);
  }

  navigateToCreate(): void {
    this.router.navigate(['/businessowner/ownerProductionRequestCreate']);
  }

  // ── Stats computed (across all requests, not just the current page) ─────
  get pendingCount(): number {
    return this.allRequests.filter(r => r.status === 0 || r.status === 1).length;
  }

  get awaitingConfirmCount(): number {
    return this.allRequests.filter(r => r.status === 2).length;
  }

  get inProductionCount(): number {
    return this.allRequests.filter(r => r.status === 3).length;
  }

  // ── Status helpers ────────────────────────────────────────────────────────
  getStatusLabel(status: number): string {
    const labels: Record<number, string> = {
      0: 'Pending Review',
      1: 'Under Review',
      2: 'Quoted',
      3: 'In Production',
      4: 'Awaiting Confirm',
      5: 'Completed',
      6: 'Delivered',
      7: 'Cancelled',
    };
    return labels[status] ?? 'Unknown';
  }

  // ── Pagination helpers ────────────────────────────────────────────────────
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const delta = 2;
    const left = Math.max(1, this.pageIndex - delta);
    const right = Math.min(this.totalPages, this.pageIndex + delta);

    if (left > 1) { pages.push(1); if (left > 2) pages.push(-1); }
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < this.totalPages) {
      if (right < this.totalPages - 1) pages.push(-1);
      pages.push(this.totalPages);
    }
    return pages;
  }

  // ── Cancel flow ──────────────────────────────────────────────────────────
  openConfirmDelete(id: number, event: Event): void {
    event.stopPropagation();
    this.confirmDeleteId = id;
  }

  closeConfirmDelete(event?: Event): void {
    event?.stopPropagation();
    this.confirmDeleteId = null;
  }

  confirmCancel(id: number, event: Event): void {
    event.stopPropagation();
    this.confirmDeleteId = null;
    this.cancellingId = id;

    this.productionRequestService.cancelRequest(id).subscribe({
      next: () => {
        this.requests = this.requests.filter(r => r.id !== id);
        this.allRequests = this.allRequests.filter(r => r.id !== id);
        this.totalCount = Math.max(0, this.totalCount - 1);
        this.cancellingId = null;
        this.showToaster('Request cancelled successfully.', 'success');
      },
      error: (err: Error) => {
        this.cancellingId = null;
        this.showToaster(err.message ?? 'Failed to cancel request.', 'error');
      }
    });
  }

  isCancelled(status: number): boolean {
    return status === 7;
  }

  // ── Confirm flow ──────────────────────────────────────────────────────────
  canConfirm(request: ProductionRequest): boolean {
    return request.quotedPrice != null && request.status === 2;
  }

  openConfirmDialog(id: number, event: Event): void {
    event.stopPropagation();
    this.confirmDialogId = id;
  }

  closeConfirmDialog(event?: Event): void {
    event?.stopPropagation();
    this.confirmDialogId = null;
  }

  submitConfirm(id: number, event: Event): void {
    event.stopPropagation();
    this.confirmDialogId = null;
    this.confirmingId = id;

    this.productionRequestService.confirmRequest(id).subscribe({
      next: (res) => {
        const newStatus = res.data?.status ?? 3;
        const target = this.requests.find(r => r.id === id);
        if (target) {
          target.status = newStatus;
        }
        const statTarget = this.allRequests.find(r => r.id === id);
        if (statTarget) {
          statTarget.status = newStatus;
        }
        this.confirmingId = null;
        this.showToaster('Request confirmed successfully.', 'success');
      },
      error: (err: Error) => {
        this.confirmingId = null;
        this.showToaster(err.message ?? 'Failed to confirm request.', 'error');
      }
    });
  }

  // ── Toaster ──────────────────────────────────────────────────────────────
  showToaster(message: string, type: 'success' | 'error'): void {
    clearTimeout(this.toasterTimer);
    this.toaster = { message, type };
    this.toasterTimer = setTimeout(() => { this.toaster = null; }, 4000);
  }

  dismissToaster(): void {
    clearTimeout(this.toasterTimer);
    this.toaster = null;
  }
}