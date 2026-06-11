import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { PayoutService } from '../../../core/services/payout.service';
import { Payout, PayoutStatus } from '../../../core/interfaces/i-payout';

@Component({
  selector: 'app-payout-history',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payout-history.component.html',
  styleUrl: './payout-history.component.css',
})
export class PayoutHistoryComponent implements OnInit {
  // Summary cards
  availableBalance = 0;
  pendingBalance = 0;
  totalEarnings = 0;
  currency = 'EGP';

  // History
  payouts: Payout[] = [];
  filteredPayouts: Payout[] = [];

  // UI state
  isLoading = true;
  errorMsg = '';

  isModalOpen = false;
  isSubmitting = false;

  toast: { message: string; type: 'success' | 'error' } | null = null;

  payoutForm!: FormGroup;

  // Pagination
  pageIndex = 1;
  pageSize = 10;
  totalPages = 1;
  totalCount = 0;

  // Filters
  selectedStatus = 'all';
  searchQuery = '';

  PayoutStatus = PayoutStatus;

  readonly statusOptions = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: '0' },
    { label: 'Approved', value: '1' },
    { label: 'Completed', value: '2' },
    { label: 'Rejected', value: '3' },
  ];

  constructor(
    private payoutService: PayoutService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.fetchHistory();
  }

  private buildForm(): void {
    this.payoutForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(1)]],
      bankName: ['', Validators.required],
      accountHolderName: ['', Validators.required],
      accountIdentifier: ['', Validators.required],
      routingSwiftCode: ['', Validators.required],
    });
  }

  fetchHistory(): void {
    this.isLoading = true;
    this.errorMsg = '';

    this.payoutService.getMyHistory(this.pageIndex, this.pageSize).subscribe({
      next: (res) => {
        this.payouts = res.data.data ?? [];

        this.totalPages = res.data.totalPages;
        this.totalCount = res.data.count;

        this.calculateSummary();
        this.applyFilters();

        this.isLoading = false;
      },
      error: (err) => {
        this.errorMsg = 'Failed to load payout history. Please try again.';
        this.isLoading = false;
        
      },
    });
  }

  private calculateSummary(): void {
    this.totalEarnings = this.payouts.reduce(
      (sum, p) => sum + p.amount,
      0
    );

    this.pendingBalance = this.payouts
      .filter((p) => p.status === PayoutStatus.Pending)
      .reduce((sum, p) => sum + p.amount, 0);

    this.availableBalance = this.payouts
      .filter((p) => p.status === PayoutStatus.Completed)
      .reduce((sum, p) => sum + p.amount, 0);

    this.currency = this.payouts[0]?.currency ?? 'EGP';
  }

  applyFilters(): void {
    let data = [...this.payouts];

    if (this.selectedStatus !== 'all') {
      data = data.filter(
        (p) => p.status === +this.selectedStatus
      );
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();

      data = data.filter(
        (p) =>
          p.bankName.toLowerCase().includes(q) ||
          p.amount.toString().includes(q)
      );
    }

    this.filteredPayouts = data;
  }

  onStatusChange(value: string): void {
    this.selectedStatus = value;
    this.applyFilters();
  }

  onSearch(value: string): void {
    this.searchQuery = value;
    this.applyFilters();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;

    this.pageIndex = page;
    this.fetchHistory();
  }

  getPages(): number[] {
    return Array.from(
      { length: this.totalPages },
      (_, i) => i + 1
    );
  }

  openModal(): void {
    this.payoutForm.reset();
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  submitPayout(): void {
    if (this.payoutForm.invalid) {
      this.payoutForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    this.payoutService.createPayout(this.payoutForm.value).subscribe({
      next: () => {
        this.isSubmitting = false;

        this.closeModal();

        this.fetchHistory();

        this.showToast(
          'Payout request submitted successfully!',
          'success'
        );
      },
      error: (err) => {
        this.isSubmitting = false;
        console.log(err);
        
        this.showToast(err.error.errors[0],'error' );
      },
    });
  }

  getStatusLabel(status: PayoutStatus): string {
    const map: Record<PayoutStatus, string> = {
      [PayoutStatus.Pending]: 'Pending',
      [PayoutStatus.Approved]: 'Approved',
      [PayoutStatus.Completed]: 'Completed',
      [PayoutStatus.Rejected]: 'Rejected',
    };

    return map[status] ?? 'Unknown';
  }

  getStatusClass(status: PayoutStatus): string {
    const map: Record<PayoutStatus, string> = {
      [PayoutStatus.Pending]: 'badge-pending',
      [PayoutStatus.Approved]: 'badge-approved',
      [PayoutStatus.Completed]: 'badge-completed',
      [PayoutStatus.Rejected]: 'badge-rejected',
    };

    return map[status] ?? '';
  }

  maskAccount(identifier: string): string {
    if (!identifier || identifier.length < 4) {
      return identifier;
    }

    return '••••' + identifier.slice(-4);
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.payoutForm.get(field);

    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  private showToast(
    message: string,
    type: 'success' | 'error'
  ): void {
    this.toast = { message, type };

    setTimeout(() => {
      this.toast = null;
    }, 4000);
  }
}