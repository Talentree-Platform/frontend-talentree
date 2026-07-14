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
  MaterialOrderListItem, MaterialOrderItem,
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
  materialOrders: MaterialOrderListItem[] = [];
  stats: OrderStats | null = null;
  selectedOrder: OrderDetail | null = null;
  selectedMaterialOrder: MaterialOrderListItem | null = null;
  activeTab: 'customer' | 'material' = 'customer';

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

  paymentStatusOptions: { value: number; label: string }[] = [
    { value: 0, label: 'Pending' },
    { value: 1, label: 'Paid' },
    { value: 2, label: 'Failed' },
    { value: 3, label: 'Refunded' },
  ];

  // Material order status options (0–5, no Confirmed step)
  materialOrderStatusOptions: { value: number; label: string }[] = [
    { value: 0, label: 'Pending' },
    { value: 1, label: 'Processing' },
    { value: 2, label: 'Shipped' },
    { value: 3, label: 'Delivered' },
    { value: 4, label: 'Cancelled' },
    { value: 5, label: 'Refunded' },
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
    const sortByParam = (this.activeTab === 'material' && this.sortBy === 'orderDate') ? 'createdAt' : this.sortBy;
    const params: OrderFilterParams = {
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      search: this.searchTerm || undefined,
      status: this.selectedStatus !== '' ? Number(this.selectedStatus) : undefined,
      paymentStatus: this.selectedPaymentStatus !== '' ? Number(this.selectedPaymentStatus) : undefined,
      dateFrom: this.dateFrom || undefined,
      dateTo: this.dateTo || undefined,
      sortBy: sortByParam || undefined,
      sortDesc: this.sortDesc,
    };

    if (this.activeTab === 'material') {
      this._OrdersService.getMaterialOrders(params)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            this.isLoading = false;
            this.materialOrders = res.data;
            this.totalPages = res.totalPages;
            this.totalCount = res.count;
            this.hasNext = res.hasNext;
            this.hasPrevious = res.hasPrevious;
            this.pageIndex = res.pageIndex;
          },
          error: (err) => {
            this.isLoading = false;
            this.materialOrders = [];
            this._ToastrService.error(
              err?.error?.message ?? 'Failed to load material orders', 'Talentree',
              { timeOut: 2500, closeButton: true }
            );
          },
        });
    } else {
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
            this.orders = [];
            this._ToastrService.error(
              err?.error?.message ?? 'Failed to load orders', 'Talentree',
              { timeOut: 2500, closeButton: true }
            );
          },
        });
    }
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
  viewOrder(order: any): void {
    this.isDetailsOpen = true;
    if (this.activeTab === 'material') {
      this.selectedMaterialOrder = order;
      this.selectedOrder = null;
      this.detailLoading = false;
      return;
    }

    this.detailLoading = true;
    this.selectedOrder = null;
    this.selectedMaterialOrder = null;

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

  // ── Helper: resolve active order ID ──────────────────────────────────────
  private get activeOrderId(): number | null {
    return this.selectedOrder?.id ?? this.selectedMaterialOrder?.id ?? null;
  }

  // ── Update status ─────────────────────────────────────────────────────────
  openStatusForm(order: any): void {
    if (this.activeTab === 'material') {
      // For material orders, use available list-item data (no need for detail fetch)
      this.selectedMaterialOrder = order as MaterialOrderListItem;
      this.selectedOrder = null;
      this.statusForm = { newStatus: order.status ?? 0, reason: '' };
      this.isStatusFormOpen = true;
      return;
    }
    this._OrdersService.getOrderById(order.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.selectedOrder = res;
          this.selectedMaterialOrder = null;
          this.statusForm = { newStatus: ORDER_STATUS_VALUES[res.status] ?? 0, reason: '' };
          this.isStatusFormOpen = true;
        },
        error: () => {
          this._ToastrService.error('Failed to load order', 'Talentree', { timeOut: 2000 });
        },
      });
  }

  submitStatusUpdate(): void {
    const orderId = this.activeOrderId;
    if (orderId === null) return;
    if (!this.statusForm.reason || this.statusForm.reason.trim().length === 0) {
      this._ToastrService.warning('Please enter a reason for the status change.', 'Required', { timeOut: 2500 });
      return;
    }
    this.statusSubmitting = true;

    this._OrdersService.updateStatus(orderId, this.statusForm)
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
  openNotesForm(order: any): void {
    if (this.activeTab === 'material') {
      this.selectedMaterialOrder = order as MaterialOrderListItem;
      this.selectedOrder = null;
      this.noteText = '';
      this.isNotesFormOpen = true;
      return;
    }
    this._OrdersService.getOrderById(order.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.selectedOrder = res;
          this.selectedMaterialOrder = null;
          this.noteText = '';
          this.isNotesFormOpen = true;
        },
        error: () => {
          this._ToastrService.error('Failed to load order', 'Talentree', { timeOut: 2000 });
        },
      });
  }

  submitNote(): void {
    const orderId = this.activeOrderId;
    if (orderId === null || !this.noteText.trim()) return;
    this.noteSubmitting = true;

    this._OrdersService.addNote(orderId, this.noteText.trim())
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
      status: this.selectedStatus !== '' ? Number(this.selectedStatus) : undefined,
      paymentStatus: this.selectedPaymentStatus !== '' ? Number(this.selectedPaymentStatus) : undefined,
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
    this.sortBy = this.activeTab === 'material' ? 'createdAt' : 'orderDate';
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
    this.selectedMaterialOrder = null;
    this.noteText = '';
    this.statusForm = { newStatus: 0, reason: '' };
  }

  setTab(tab: 'customer' | 'material'): void {
    if (this.activeTab === tab) return;
    this.activeTab = tab;
    this.clearFilters();
  }

  getMaterialOrderStatusLabel(status: number): string {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Processing';
      case 2: return 'Shipped';
      case 3: return 'Delivered';
      case 4: return 'Cancelled';
      case 5: return 'Refunded';
      default: return 'Unknown';
    }
  }

  materialOrderStatusClass(status: number): string {
    switch (status) {
      case 0: return 'status-pending';
      case 1: return 'status-processing';
      case 2: return 'status-shipped';
      case 3: return 'status-delivered';
      case 4: return 'status-cancelled';
      case 5: return 'status-refunded';
      default: return 'status-pending';
    }
  }

  getMaterialPaymentStatusLabel(status: number): string {
    switch (status) {
      case 0: return 'Unpaid';
      case 1: return 'Paid';
      case 2: return 'Failed';
      case 3: return 'Refunded';
      default: return 'Unknown';
    }
  }

  materialPaymentStatusClass(status: number): string {
    switch (status) {
      case 0: return 'pay-pending';
      case 1: return 'pay-paid';
      case 2: return 'pay-failed';
      case 3: return 'pay-refunded';
      default: return 'pay-pending';
    }
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