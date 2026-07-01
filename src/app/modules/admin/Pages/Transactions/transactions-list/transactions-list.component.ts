import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { AdminTransactionsService } from '../../../core/services/admin-transaction.service';
import {
  Transaction,
  TransactionQueryParams,
  PaginatedResponse,
  TransactionType,
  TRANSACTION_TYPE_LABELS,
} from '../../../core/services/transactions.model';
import { TransactionsAnalyticsComponent } from '../transactions-analytics/transactions-analytics.component';
import { TransactionDetailsComponent } from '../transaction-details/transaction-details.component';

@Component({
  selector: 'app-transactions-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TransactionsAnalyticsComponent,
    TransactionDetailsComponent,
  ],
  templateUrl: './transactions-list.component.html',
  styleUrls: ['./transactions-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionsListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private search$ = new Subject<string>();

  // ── State ──────────────────────────────────────────────────────────────────
  transactions: Transaction[] = [];
  totalCount = 0;
  totalPages = 0;
  loading = false;
  exporting = false;
  error = false;
  errorMessage = '';

  // ── Filters ────────────────────────────────────────────────────────────────
  searchTerm = '';
  selectedTransactionType: number | '' = '';
  boIdFilter: number | '' = '';
  dateFrom = '';
  dateTo = '';
  anomalyOnly = false;
  sortBy = 'createdAt';
  sortDir: 'asc' | 'desc' = 'desc';

  // ── Pagination (1-based) ───────────────────────────────────────────────────
  pageIndex = 1;
  pageSize = 10;

  // ── Modals ─────────────────────────────────────────────────────────────────
  selectedTransaction: Transaction | null = null;
  showExportModal = false;
  exportFrom = '';
  exportTo = '';

  // ── Dropdown options ───────────────────────────────────────────────────────
  typeOptions = Object.entries(TRANSACTION_TYPE_LABELS).map(([k, v]) => ({
    value: Number(k), label: v,
  }));

  typeLabels = TRANSACTION_TYPE_LABELS;
  TransactionType = TransactionType;

  constructor(
    private svc: AdminTransactionsService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.search$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(term => {
        this.searchTerm = term;
        this.pageIndex = 1;
        this.fetchTransactions();
      });

    this.fetchTransactions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Fetch ──────────────────────────────────────────────────────────────────

  fetchTransactions(): void {
    this.loading = true;
    this.error = false;

    const params: TransactionQueryParams = {
      PageIndex: this.pageIndex,
      PageSize: this.pageSize,
    };

    if (this.searchTerm) params.Search = this.searchTerm;
    if (this.boIdFilter !== '') params.BoId = this.boIdFilter as number;
    if (this.selectedTransactionType !== '') params.Type = this.selectedTransactionType as number;
    if (this.anomalyOnly) params.AnomalyFlaggedOnly = true;
    if (this.dateFrom) params.DateFrom = new Date(this.dateFrom).toISOString();
    if (this.dateTo) params.DateTo = new Date(this.dateTo).toISOString();

    this.svc.getTransactions(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const paged = res as PaginatedResponse<Transaction>;
          this.transactions = paged.data ?? [];
          this.totalCount = paged.count ?? 0;
          this.totalPages = paged.totalPages ?? 1;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.loading = false;
          this.error = true;
          this.errorMessage = err?.error?.message || 'Failed to load transactions. Please try again.';
          this.cdr.markForCheck();
        },
      });
  }

  onSearchInput(term: string): void { this.search$.next(term); }

  onFilterChange(): void {
    this.pageIndex = 1;
    this.fetchTransactions();
  }

  refresh(): void { this.fetchTransactions(); }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedTransactionType = '';
    this.boIdFilter = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.anomalyOnly = false;
    this.pageIndex = 1;
    this.fetchTransactions();
  }

  // ── Sort ───────────────────────────────────────────────────────────────────

  sort(column: string): void {
    this.sortDir = this.sortBy === column
      ? (this.sortDir === 'asc' ? 'desc' : 'asc')
      : 'asc';
    this.sortBy = column;
    this.fetchTransactions();
  }

  sortIcon(col: string): string {
    if (this.sortBy !== col) return 'fa-sort';
    return this.sortDir === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  // ── Pagination ─────────────────────────────────────────────────────────────

  get pages(): number[] {
    const range: number[] = [];
    const delta = 2;
    for (
      let i = Math.max(1, this.pageIndex - delta);
      i <= Math.min(this.totalPages, this.pageIndex + delta);
      i++
    ) { range.push(i); }
    return range;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.pageIndex = page;
    this.fetchTransactions();
  }

  onPageSizeChange(size: string): void {
    this.pageSize = Number(size);
    this.pageIndex = 1;
    this.fetchTransactions();
  }

  get startItem(): number {
    return this.totalCount === 0 ? 0 : (this.pageIndex - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.pageIndex * this.pageSize, this.totalCount);
  }

  // ── Detail Modal ───────────────────────────────────────────────────────────

  openDetails(tx: Transaction): void {
    this.selectedTransaction = tx;
    this.cdr.markForCheck();
  }

  closeDetails(): void {
    this.selectedTransaction = null;
    this.cdr.markForCheck();
  }

  // ── Export ─────────────────────────────────────────────────────────────────

  openExportModal(): void { this.showExportModal = true; this.cdr.markForCheck(); }
  closeExportModal(): void { this.showExportModal = false; this.cdr.markForCheck(); }

  exportReport(): void {
    this.exporting = true;
    this.showExportModal = false;

    const query = {
      from: this.exportFrom ? new Date(this.exportFrom).toISOString() : undefined,
      to: this.exportTo ? new Date(this.exportTo).toISOString() : undefined,
    };

    this.svc.downloadReport(query)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          const now = new Date().toISOString().slice(0, 10);
          a.href = url;
          a.download = `transactions-report-${now}.xlsx`;
          a.click();
          URL.revokeObjectURL(url);
          this.exporting = false;
          this.toastr.success('Report downloaded successfully!', 'Export Complete');
          this.cdr.markForCheck();
        },
        error: () => {
          this.exporting = false;
          this.toastr.error('Failed to export report. Please try again.', 'Export Failed');
          this.cdr.markForCheck();
        },
      });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD', minimumFractionDigits: 2,
    }).format(amount);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: '2-digit',
    });
  }

  trackById(_: number, tx: Transaction): number { return tx.id; }
}