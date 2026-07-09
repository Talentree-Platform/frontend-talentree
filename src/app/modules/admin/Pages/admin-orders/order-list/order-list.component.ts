import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { AdminOrdersService } from '../../../core/services/admin-orders.service';
import { PaginationComponent } from '../../../Components/pagination/pagination.component';
import {
  OrderListItem, OrderDetail, OrderStats, OrderFilterParams,
  OrderStatus, PaymentStatus,
  ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, ORDER_STATUS_VALUES,
  UpdateOrderStatusDto,
} from '../../../core/Interfaces/iorder';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css',
})
export class OrderListComponent implements OnInit, OnDestroy {

  constructor(
    private _OrdersService: AdminOrdersService,
    private _ToastrService: ToastrService,
  ) { }

  private destroy$ = new Subject<void>();

  // ── Data ──────────────────────────────────────────────────────────────────
  orders: OrderListItem[] = [];
  stats: OrderStats | null = null;
  selectedOrder: OrderDetail | null = null;

  // ── Loading states ────────────────────────────────────────────────────────
  isLoading = false;
  statsLoading = false;
  detailLoading = false;
  exportLoading = false;

  // ── Modal states ──────────────────────────────────────────────────────────
  isDetailsOpen = false;
  isStatusFormOpen = false;
  isNotesFormOpen = false;

  // ── Filters ───────────────────────────────────────────────────────────────
  searchTerm = '';
  selectedStatus: string = '';
  selectedPaymentStatus: string = '';
  dateFrom = '';
  dateTo = '';
  sortBy = 'orderDate';
  sortDesc = true;

  // ── Pagination ────────────────────────────────────────────────────────────
  pageIndex = 1;
  pageSize = 20;
  totalPages = 0;
  totalCount = 0;
  hasNext = false;
  hasPrevious = false;

  // ── Status / Notes forms ──────────────────────────────────────────────────
  statusForm: UpdateOrderStatusDto = { newStatus: 0, reason: '' };
  noteText = '';
  statusSubmitting = false;
  noteSubmitting = false;

  // ── Label maps for template ───────────────────────────────────────────────
  ORDER_STATUS_LABELS = ORDER_STATUS_LABELS;
  PAYMENT_STATUS_LABELS = PAYMENT_STATUS_LABELS;

  // Status options use integer values (matching backend CustomerOrderStatus enum)
  orderStatusOptions: { value: number; label: string }[] = [
    { value: 0, label: 'Pending' },
    { value: 1, label: 'Confirmed' },
    { value: 2, label: 'Processing' },
    { value: 3, label: 'Shipped' },
    { value: 4, label: 'Delivered' },
    { value: 5, label: 'Cancelled' },
    { value: 6, label: 'Refunded' },
  ];

  paymentStatusOptions: { value: PaymentStatus; label: string }[] = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Paid', label: 'Paid' },
    { value: 'Failed', label: 'Failed' },
    { value: 'Refunded', label: 'Refunded' },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.load();
    this.loadStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Load orders ───────────────────────────────────────────────────────────
  load(): void {
    this.isLoading = true;
    const params: OrderFilterParams = {
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      search: this.searchTerm || undefined,
      status: this.selectedStatus !== '' ? this.selectedStatus as OrderStatus : undefined,
      paymentStatus: this.selectedPaymentStatus !== '' ? this.selectedPaymentStatus as PaymentStatus : undefined,
      dateFrom: this.dateFrom || undefined,
      dateTo: this.dateTo || undefined,
      sortBy: this.sortBy || undefined,
      sortDesc: this.sortDesc,
    };

    this._OrdersService.getOrders(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          this.orders = res.data;
          this.totalPages = res.totalPages;
          this.totalCount = res.count;
          this.hasNext = res.hasNext;
          this.hasPrevious = res.hasPrevious;
          this.pageIndex = res.pageIndex;
        },
        error: (err) => {
          this.isLoading = false;
          this._ToastrService.error(
            err?.error?.message ?? 'Failed to load orders', 'Talentree',
            { timeOut: 2500, closeButton: true }
          );
        },
      });
  }

  // ── Load stats ────────────────────────────────────────────────────────────
  loadStats(): void {
    this.statsLoading = true;
    this._OrdersService.getStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.statsLoading = false;
          this.stats = res ;
        },
        error: (err) => {
          this.statsLoading = false;
          this._ToastrService.error('Failed to load stats', 'Talentree', { timeOut: 2000 });
        },
      });
  }

  // ── View order details ────────────────────────────────────────────────────
  viewOrder(order: OrderListItem): void {
    this.detailLoading = true;
    this.isDetailsOpen = true;
    this.selectedOrder = null;

    this._OrdersService.getOrderById(order.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.detailLoading = false;
          this.selectedOrder = res;
        },
        error: () => {
          this.detailLoading = false;
          this._ToastrService.error('Failed to load order details', 'Talentree', { timeOut: 2000 });
        },
      });
  }

  // ── Update status ─────────────────────────────────────────────────────────
  openStatusForm(order: OrderListItem): void {
    this._OrdersService.getOrderById(order.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.selectedOrder = res;
          // Map string status (from GET response) to integer (required by PUT endpoint)
          this.statusForm = { newStatus: ORDER_STATUS_VALUES[res.status] ?? 0, reason: '' };
          this.isStatusFormOpen = true;
        },
        error: () => {
          this._ToastrService.error('Failed to load order', 'Talentree', { timeOut: 2000 });
        },
      });
  }

  submitStatusUpdate(): void {
    if (!this.selectedOrder) return;
    if (!this.statusForm.reason || this.statusForm.reason.trim().length === 0) {
      this._ToastrService.warning('Please enter a reason for the status change.', 'Required', { timeOut: 2500 });
      return;
    }
    this.statusSubmitting = true;

    this._OrdersService.updateStatus(this.selectedOrder.id, this.statusForm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.statusSubmitting = false;
          this._ToastrService.success('Order status updated!', 'Talentree', { timeOut: 2000, closeButton: true });
          this.closeModals();
          this.load();
        },
        error: (err) => {
          this.statusSubmitting = false;
          this._ToastrService.error(
            err?.error?.message ?? 'Failed to update status', 'Talentree', { timeOut: 2500, closeButton: true }
          );
        },
      });
  }

  // ── Add note ──────────────────────────────────────────────────────────────
  openNotesForm(order: OrderListItem): void {
    this._OrdersService.getOrderById(order.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.selectedOrder = res;
          this.noteText = '';
          this.isNotesFormOpen = true;
        },
        error: () => {
          this._ToastrService.error('Failed to load order', 'Talentree', { timeOut: 2000 });
        },
      });
  }

  submitNote(): void {
    if (!this.selectedOrder || !this.noteText.trim()) return;
    this.noteSubmitting = true;

    this._OrdersService.addNote(this.selectedOrder.id, this.noteText.trim())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.noteSubmitting = false;
          this._ToastrService.success('Note added!', 'Talentree', { timeOut: 2000, closeButton: true });
          this.closeModals();
        },
        error: (err) => {
          this.noteSubmitting = false;
          this._ToastrService.error(
            err?.error?.message ?? 'Failed to add note', 'Talentree', { timeOut: 2500, closeButton: true }
          );
        },
      });
  }

  // ── Export ────────────────────────────────────────────────────────────────
  exportOrders(): void {
    this.exportLoading = true;
    const params: OrderFilterParams = {
      search: this.searchTerm || undefined,
      status: this.selectedStatus !== '' ? this.selectedStatus as OrderStatus : undefined,
      paymentStatus: this.selectedPaymentStatus !== '' ? this.selectedPaymentStatus as PaymentStatus : undefined,
      dateFrom: this.dateFrom || undefined,
      dateTo: this.dateTo || undefined,
      sortBy: this.sortBy || undefined,
      sortDesc: this.sortDesc,
    };

    this._OrdersService.exportOrders(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          this.exportLoading = false;
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `orders-export-${new Date().toISOString().slice(0, 10)}.xlsx`;
          a.click();
          window.URL.revokeObjectURL(url);
          this._ToastrService.success('Export downloaded!', 'Talentree', { timeOut: 2000, closeButton: true });
        },
        error: () => {
          this.exportLoading = false;
          this._ToastrService.error('Export failed. Please try again.', 'Talentree', { timeOut: 2500, closeButton: true });
        },
      });
  }

  // ── Filters ───────────────────────────────────────────────────────────────
  onSearch(): void {
    this.pageIndex = 1;
    this.load();
  }

  onFilterChange(): void {
    this.pageIndex = 1;
    this.load();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedPaymentStatus = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.sortBy = 'orderDate';
    this.sortDesc = true;
    this.pageIndex = 1;
    this.statusForm = { newStatus: 0, reason: '' };
    this.load();
  }

  toggleSort(field: string): void {
    if (this.sortBy === field) {
      this.sortDesc = !this.sortDesc;
    } else {
      this.sortBy = field;
      this.sortDesc = true;
    }
    this.load();
  }

  refresh(): void {
    this.load();
    this.loadStats();
  }

  // ── Modals ────────────────────────────────────────────────────────────────
  closeModals(): void {
    this.isDetailsOpen = false;
    this.isStatusFormOpen = false;
    this.isNotesFormOpen = false;
    this.selectedOrder = null;
    this.noteText = '';
    this.statusForm = { newStatus: 0, reason: '' };
  }

  // ── Pagination ────────────────────────────────────────────────────────────
  pageChangeEvent(page: number): void {
    this.pageIndex = page;
    this.load();
  }

  // ── UI Helpers ────────────────────────────────────────────────────────────
  orderStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Pending': 'status-pending',
      'Confirmed': 'status-confirmed',
      'Processing': 'status-processing',
      'Shipped': 'status-shipped',
      'Delivered': 'status-delivered',
      'Cancelled': 'status-cancelled',
      'Refunded': 'status-refunded',
    };
    return map[status] ?? 'status-pending';
  }

  paymentStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Pending': 'pay-pending',
      'Paid': 'pay-paid',
      'Failed': 'pay-failed',
      'Unpaid': 'pay-pending',
      'Refunded': 'pay-refunded',
    };
    return map[status] ?? 'pay-pending';
  }

  formatCurrency(val: number | null | undefined): string {
    if (val == null) return '—';
    return '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  formatDate(val: string | null | undefined): string {
    if (!val) return '—';
    return new Date(val).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }

  formatDateTime(val: string | null | undefined): string {
    if (!val) return '—';
    return new Date(val).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  // Stats helpers
  statNum(val: number | null | undefined): string {
    if (val == null) return '—';
    return val.toLocaleString('en-US');
  }

  growthClass(val: number | null | undefined): string {
    if (val == null) return '';
    return val >= 0 ? 'growth-pos' : 'growth-neg';
  }
}