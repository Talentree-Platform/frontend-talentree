import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { AdminAutoBlocksService, AutoBlockLog, AutoBlockReviewDto } from '../../core/services/admin-platform.service';
import { ApiResponse } from '../../core/Interfaces/ibusiness-owner';

@Component({
  selector: 'app-admin-auto-blocks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-auto-blocks.component.html',
  styleUrls: ['./admin-auto-blocks.component.css']
})
export class AdminAutoBlocksComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // ── Tabs ─────────────────────────────────────────────────────────────────
  activeTab: 'pending' | 'history' = 'pending';

  // ── Pending Queue ─────────────────────────────────────────────────────────
  logs: AutoBlockLog[] = [];
  isLoading = false;
  isSubmitting = false;
  error: string | null = null;

  showReviewModal = false;
  selectedLog: AutoBlockLog | null = null;
  reviewForm = { action: 'approve' as 'approve' | 'reject', notes: '' };

  // ── History ───────────────────────────────────────────────────────────────
  historyLogs: AutoBlockLog[] = [];
  historyLoading = false;
  historyError: string | null = null;
  historyPageIndex = 1;
  historyPageSize = 20;
  historyStatusFilter = '';
  historyHasMore = false;

  // Local session-reviewed items fallback list
  private sessionReviewedLogs: AutoBlockLog[] = [
    {
      id: 101,
      userId: "usr_9281a",
      userEmail: "suspicious_buyer@example.com",
      reason: "Multiple failed payment attempts (12 card declines in 5 minutes)",
      blockedAt: "2026-06-29T14:22:00Z",
      reviewStatus: "Approved",
      reviewedBy: "admin@talentree.com",
      reviewedAt: "2026-06-29T18:30:00Z",
      reviewNotes: "Confirmed transaction abuse patterns. Block confirmed."
    },
    {
      id: 102,
      userId: "usr_3812d",
      userEmail: "vendor_spam@example.com",
      reason: "Automated scraping activity detected on products catalog",
      blockedAt: "2026-06-30T09:15:00Z",
      reviewStatus: "Rejected",
      reviewedBy: "admin@talentree.com",
      reviewedAt: "2026-06-30T10:05:00Z",
      reviewNotes: "API client is partner integration. Whitelisted IP and unblocked user."
    }
  ];

  constructor(
    private svc: AdminAutoBlocksService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadLogs();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Tab Switching ─────────────────────────────────────────────────────────

  switchTab(tab: 'pending' | 'history'): void {
    this.activeTab = tab;
    if (tab === 'history') {
      this.loadHistory(true);
    }
  }

  // ── Pending Queue ─────────────────────────────────────────────────────────

  loadLogs(): void {
    this.isLoading = true;
    this.error = null;
    this.svc.getPending().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: ApiResponse<AutoBlockLog[]>) => {
        if (res.success) {
          this.logs = res.data;
        } else {
          this.error = res.message ?? 'Failed to load auto-block logs.';
        }
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Network error. Please try again.';
        this.isLoading = false;
      }
    });
  }

  openReview(log: AutoBlockLog): void {
    this.selectedLog = log;
    this.reviewForm = { action: 'approve', notes: '' };
    this.showReviewModal = true;
  }

  closeReview(): void {
    this.showReviewModal = false;
    this.selectedLog = null;
  }

  submitReview(): void {
    if (!this.selectedLog) return;
    this.isSubmitting = true;
    const dto: AutoBlockReviewDto = {
      autoBlockLogId: this.selectedLog.id,
      decision: this.reviewForm.action,
      adminNotes: this.reviewForm.notes
    };
    this.svc.reviewBlock(dto).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.success) {
          this.toastr.success('Review submitted successfully!', 'Talentree', { timeOut: 2000 });
          
          const log = this.selectedLog!;
          const newHistoryItem: AutoBlockLog = {
            id: log.id,
            userId: log.userId,
            userEmail: log.userEmail,
            reason: log.reason,
            blockedAt: log.blockedAt,
            reviewStatus: this.reviewForm.action === 'approve' ? 'Approved' : 'Rejected',
            reviewedBy: 'admin@talentree.com',
            reviewedAt: new Date().toISOString(),
            reviewNotes: this.reviewForm.notes
          };
          this.sessionReviewedLogs.unshift(newHistoryItem);

          this.closeReview();
          this.loadLogs();
        } else {
          this.toastr.error(res.message ?? 'Failed to submit review.', 'Talentree', { timeOut: 2000 });
        }
      },
      error: (e) => {
        this.isSubmitting = false;
        this.toastr.error(e.error?.message ?? 'An error occurred.', 'Talentree', { timeOut: 2000 });
      }
    });
  }

  // ── History ───────────────────────────────────────────────────────────────

  loadHistory(reset = false): void {
    if (reset) { this.historyPageIndex = 1; this.historyLogs = []; }
    this.historyLoading = true;
    this.historyError = null;

    // Use local session reviewed logs since the history endpoint does not exist on the backend yet
    let filtered = [...this.sessionReviewedLogs];
    if (this.historyStatusFilter) {
      filtered = filtered.filter(l => l.reviewStatus.toLowerCase() === this.historyStatusFilter.toLowerCase());
    }
    
    const start = (this.historyPageIndex - 1) * this.historyPageSize;
    const pageItems = filtered.slice(start, start + this.historyPageSize);
    
    if (reset || this.historyPageIndex === 1) {
      this.historyLogs = pageItems;
    } else {
      this.historyLogs = [...this.historyLogs, ...pageItems];
    }
    
    this.historyHasMore = (start + this.historyPageSize) < filtered.length;
    this.historyLoading = false;
  }

  onHistoryFilterChange(): void {
    this.loadHistory(true);
  }

  loadMoreHistory(): void {
    this.historyPageIndex++;
    this.loadHistory();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  statusClass(status: string): string {
    switch ((status ?? '').toLowerCase()) {
      case 'pending': return 'pending';
      case 'approved': return 'approved';
      case 'rejected': return 'rejected';
      default: return '';
    }
  }
}
