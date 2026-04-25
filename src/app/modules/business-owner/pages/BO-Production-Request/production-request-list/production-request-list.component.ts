import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProductionRequest } from '../../../core/interfaces/i-production-request';
import { BoProductionRequestService } from '../../../core/services/bo-production-request.service';
import { Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-production-request-list',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './production-request-list.component.html',
  styleUrl: './production-request-list.component.css'
})
export class ProductionRequestListComponent implements OnInit, OnDestroy {
  requests: ProductionRequest[] = [];
  totalPages: number = 0;

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
  confirmingId: number | null = null;       // tracks loading state per card
  confirmDialogId: number | null = null;    // tracks which card shows the confirm dialog

  constructor(
    private productionRequestService: BoProductionRequestService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRequests();
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
        this.loading = false;
      },
      error: (err: Error) => {
        this.error = err.message ?? 'An unexpected error occurred.';
        this.loading = false;
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

  /** Only show Confirm button when quoted and awaiting client confirmation */
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
        // Optimistic update: patch status directly in the list
        const target = this.requests.find(r => r.id === id);
        if (target) {
          target.status = res.data?.status ?? 3; // 3 = In Progress (post-confirm)
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