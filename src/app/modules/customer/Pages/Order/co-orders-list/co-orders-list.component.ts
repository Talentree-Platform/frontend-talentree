// ─────────────────────────────────────────────────────────────────────────────
// Talentree · co-orders-list — Orders History
// ─────────────────────────────────────────────────────────────────────────────
import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { CustomerOrdersService } from '../../../Core/services/customer-orders.service';
import { OrderStatus } from '../../../Core/models/co-order.models';

type StatusTab = { value: OrderStatus | 'all'; label: string };

@Component({
  selector: 'app-co-orders-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './co-orders-list.component.html',
  styleUrls: ['./co-orders-list.component.scss'],
})
export class CoOrdersListComponent implements OnInit {
  protected readonly svc = inject(CustomerOrdersService);

  readonly statusTabs: StatusTab[] = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  readonly activeStatus = signal<OrderStatus | 'all'>('all');
  readonly searchTerm = signal('');
  readonly pageIndex = signal(1);
  readonly pageSize = 8;

  private readonly searchInput$ = new Subject<string>();

  readonly totalPages = computed(() => this.svc.orders()?.totalPages ?? 1);
  // CoPaginatedOrders uses "count", not "totalCount"
  readonly totalCount = computed(() => this.svc.orders()?.count ?? 0);
  // CoPaginatedOrders uses "data", not "items"
  readonly items = computed(() => this.svc.orders()?.data ?? []);

  readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.pageIndex();
    const span = 2;
    const pages: number[] = [];
    for (let p = Math.max(1, current - span); p <= Math.min(total, current + span); p++) {
      pages.push(p);
    }
    return pages;
  });

  constructor() {
    this.searchInput$.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe((term) => {
      this.searchTerm.set(term);
      this.pageIndex.set(1);
      this.fetch();
    });
  }

  ngOnInit(): void {
    this.fetch();
  }

  onSearchChange(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.searchInput$.next(term);
  }

  selectStatus(status: OrderStatus | 'all'): void {
    if (this.activeStatus() === status) return;
    this.activeStatus.set(status);
    this.pageIndex.set(1);
    this.fetch();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.pageIndex()) return;
    this.pageIndex.set(page);
    this.fetch();
  }

  retry(): void {
    this.fetch();
  }

  private fetch(): void {
    this.svc.loadOrders({
      status: this.activeStatus(),
      search: this.searchTerm(),
      pageIndex: this.pageIndex(),
      pageSize: this.pageSize,
    });
  }

  statusBadgeClass(status: OrderStatus): string {
    return `co-badge co-badge--${status}`;
  }

  paymentBadgeClass(status: string): string {
    return `co-pay-badge co-pay-badge--${status}`;
  }
}