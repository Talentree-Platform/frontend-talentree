import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { PayoutAdminService } from '../../../core/services/admin-payout.service';
import { Payout, PayoutStatus, PayoutSummary } from '../../../core/Interfaces/iadmin-payout';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

@Component({
  selector: 'app-payout-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payout-dashboard.component.html',
  styleUrl: './payout-dashboard.component.scss'
})
export class PayoutDashboardComponent implements OnInit, OnDestroy {
  private readonly svc = inject(PayoutAdminService);
  private readonly destroy$ = new Subject<void>();
  private readonly search$ = new Subject<string>();
  private toastCounter = 0;

  // ── State ──────────────────────────────────────────────
  payouts = signal<Payout[]>([]);
  isLoading = signal(true);
  totalCount = signal(0);

  pageIndex = signal(1);
  pageSize = signal(10);

  selectedStatus = signal<string>('all');
  searchQuery = signal('');

  // ── FIX: Reject Modal uses ID instead of full object ──
  rejectTargetId = signal<number | null>(null);
  rejectReason = signal('');

  isRejecting = signal(false);

  actionLoading = signal<Record<number, boolean>>({});

  toasts = signal<Toast[]>([]);

  summary = signal<PayoutSummary>({
    pending: 0,
    approved: 0,
    completed: 0,
    rejected: 0
  });

  readonly PayoutStatus = PayoutStatus;

  readonly statusOptions = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: String(PayoutStatus.Pending) },
    { label: 'Approved', value: String(PayoutStatus.Approved) },
    { label: 'Completed', value: String(PayoutStatus.Completed) },
    { label: 'Rejected', value: String(PayoutStatus.Rejected) },
  ];

  totalPages = computed(() =>
    Math.ceil(this.totalCount() / this.pageSize()) || 1
  );

  pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  filteredPayouts = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const statusStr = this.selectedStatus();

    let list = this.payouts();

    if (statusStr !== 'all') {
      const statusNum = Number(statusStr);
      list = list.filter(p => p.status === statusNum);
    }

    if (q) {
      list = list.filter(
        p =>
          String(p.id).includes(q) ||
          p.accountHolderName.toLowerCase().includes(q)
      );
    }

    return list;
  });

  ngOnInit(): void {
    this.loadPayouts();

    this.search$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(q => {
        this.searchQuery.set(q);
        this.pageIndex.set(1);
        this.loadPayouts();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Data ───────────────────────────────────────────────

  private get apiStatus(): number | null {
    const v = this.selectedStatus();
    return v === 'all' ? null : Number(v);
  }

  loadPayouts(): void {
    this.isLoading.set(true);

    this.svc
      .getPayouts(this.pageIndex(), this.pageSize(), this.apiStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const items = res.data.data;
          this.payouts.set(items);
          this.totalCount.set(res.data.count);
          this.computeSummary(items);
          this.isLoading.set(false);
        },
        error: () => {
          this.showToast('Failed to load payouts.', 'error');
          this.isLoading.set(false);
        },
      });
  }

  private computeSummary(items: Payout[]): void {
    const s: PayoutSummary = {
      pending: 0,
      approved: 0,
      completed: 0,
      rejected: 0,
    };

    items.forEach(p => {
      if (p.status === PayoutStatus.Pending) s.pending++;
      if (p.status === PayoutStatus.Approved) s.approved++;
      if (p.status === PayoutStatus.Completed) s.completed++;
      if (p.status === PayoutStatus.Rejected) s.rejected++;
    });

    this.summary.set(s);
  }

  // ── Filters ────────────────────────────────────────────

  onStatusChange(value: string): void {
    this.selectedStatus.set(value);
    this.pageIndex.set(1);
    this.loadPayouts();
  }

  onSearch(q: string): void {
    this.search$.next(q);
  }

  // ── Pagination ─────────────────────────────────────────

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.pageIndex.set(page);
    this.loadPayouts();
  }

  // ── Row loading ────────────────────────────────────────

  setRowLoading(id: number, state: boolean): void {
    this.actionLoading.update(m => ({ ...m, [id]: state }));
  }

  // ── Actions ────────────────────────────────────────────

  approve(payout: Payout): void {
    this.setRowLoading(payout.id, true);

    this.svc.approve(payout.id).subscribe({
      next: () => {
        this.setRowLoading(payout.id, false);
        this.showToast(`Payout #${payout.id} approved.`, 'success');
        this.loadPayouts();
      },
      error: () => {
        this.setRowLoading(payout.id, false);
        this.showToast('Failed to approve payout.', 'error');
      },
    });
  }

  complete(payout: Payout): void {
    this.setRowLoading(payout.id, true);

    this.svc.complete(payout.id).subscribe({
      next: () => {
        this.setRowLoading(payout.id, false);
        this.showToast(`Payout #${payout.id} completed.`, 'success');
        this.loadPayouts();
      },
      error: () => {
        this.setRowLoading(payout.id, false);
        this.showToast('Failed to complete payout.', 'error');
      },
    });
  }

  // ── Reject Modal (FIXED) ───────────────────────────────

  openRejectModal(payout: Payout): void {
    
    console.log('🔥 OPEN CLICKED', payout.id);

  this.rejectTargetId.set(payout.id);
    this.rejectReason.set('');

  console.log('STATE AFTER:', this.rejectTargetId());
  }

  closeRejectModal(): void {
    console.log('❌ CLOSE CALLED');
    this.rejectTargetId.set(null);
    this.rejectReason.set('');

  }

  getSelectedPayout(): Payout | undefined {
    return this.payouts().find(p => p.id === this.rejectTargetId());
  }

  submitReject(): void {
    const target = this.getSelectedPayout();

    if (!target || !this.rejectReason().trim()) return;

    this.isRejecting.set(true);

    this.svc.reject(target.id, this.rejectReason()).subscribe({
      next: () => {
        this.isRejecting.set(false);
        this.closeRejectModal();
        this.showToast(`Payout #${target.id} rejected.`, 'success');
        this.loadPayouts();
      },
      error: () => {
        this.isRejecting.set(false);
        this.showToast('Failed to reject payout.', 'error');
      },
    });
  }

  // ── Helpers ────────────────────────────────────────────

  getStatusLabel(status: PayoutStatus): string {
    return {
      [PayoutStatus.Pending]: 'Pending',
      [PayoutStatus.Approved]: 'Approved',
      [PayoutStatus.Completed]: 'Completed',
      [PayoutStatus.Rejected]: 'Rejected',
    }[status] ?? 'Unknown';
  }

  getStatusClass(status: PayoutStatus): string {
    return {
      [PayoutStatus.Pending]: 'badge--pending',
      [PayoutStatus.Approved]: 'badge--approved',
      [PayoutStatus.Completed]: 'badge--completed',
      [PayoutStatus.Rejected]: 'badge--rejected',
    }[status] ?? '';
  }

  showToast(message: string, type: 'success' | 'error'): void {
    const id = ++this.toastCounter;

    this.toasts.update(t => [...t, { id, message, type }]);

    setTimeout(() => {
      this.toasts.update(t => t.filter(x => x.id !== id));
    }, 4000);
  }

  trackById(_: number, item: Payout): number {
    return item.id;
  }
}