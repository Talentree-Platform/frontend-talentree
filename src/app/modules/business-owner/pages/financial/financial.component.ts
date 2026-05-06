import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { FinancialService } from '../../core/services/financial.service';
import {
  FinancialSummary,
  FinancialTransaction,
  FinancialPaginatedTransactions,
  TransactionType,
} from '../../core/services/financial.models';

@Component({
  selector: 'app-financial',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './financial.component.html',
  styleUrls: ['./financial.component.css'],
})
export class FinancialComponent implements OnInit, OnDestroy {
  summary: FinancialSummary | null = null;
  transactions: FinancialTransaction[] = [];
  pagination: Omit<FinancialPaginatedTransactions, 'data'> | null = null;

  loadingSummary = false;
  loadingTransactions = false;
  errorSummary: string | null = null;
  errorTransactions: string | null = null;

  selectedType: number | '' = '';
  page = 1;
  readonly pageSize = 20;

  fromDate = '';
  toDate = '';

  TransactionType = TransactionType;

  typeLabels: Record<number, string> = {
    0: 'Sale',
    1: 'Expense',
    2: 'Fee',
    3: 'Refund',
    4: 'Withdrawal',
    5: 'Deposit',
  };

  private destroy$ = new Subject<void>();

  constructor(private financialService: FinancialService) {}

  ngOnInit(): void {
    this.fetchSummary();
    this.fetchTransactions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchSummary(): void {
    this.loadingSummary = true;
    this.errorSummary = null;
    this.financialService
      .getSummary(this.fromDate || undefined, this.toDate || undefined)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => { this.summary = data; this.loadingSummary = false; },
        error: () => { this.errorSummary = 'Failed to load summary.'; this.loadingSummary = false; },
      });
  }

  fetchTransactions(): void {
    this.loadingTransactions = true;
    this.errorTransactions = null;
    this.financialService
      .getTransactions({
        type: this.selectedType !== '' ? +this.selectedType : undefined,
        pageIndex: this.page,
        pageSize: this.pageSize,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const { data, ...meta } = res;
          this.transactions = data;
          this.pagination = meta;
          this.loadingTransactions = false;
        },
        error: () => { this.errorTransactions = 'Failed to load transactions.'; this.loadingTransactions = false; },
      });
  }

  onTypeChange(): void { this.page = 1; this.fetchTransactions(); }
  onDateChange(): void { this.fetchSummary(); }

  prev(): void { if (this.pagination?.hasPrevious) { this.page--; this.fetchTransactions(); scrollTo(0, 0); } }
  next(): void { if (this.pagination?.hasNext)     { this.page++; this.fetchTransactions(); scrollTo(0, 0); } }

  isPositive(amount: number): boolean { return amount > 0; }
}