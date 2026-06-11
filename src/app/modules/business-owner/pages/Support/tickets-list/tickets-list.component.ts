import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  Subject, combineLatest, debounceTime, distinctUntilChanged,
  switchMap, takeUntil, startWith, BehaviorSubject, of, catchError,
} from 'rxjs';
import { NgIf, NgFor } from '@angular/common';

import { SupportService }        from '../../../core/services/support.service';
import { Ticket, PaginatedResponse } from '../../../core/interfaces/i-support';
import { StatusBadgeComponent }  from '../../../components/statues-badge/statues-badge.component';
import { SkeletonComponent }     from '../../../components/skeleton/skeleton.component';
import { ToastContainerComponent } from '../../../components/toast-container/toast-container.component';

interface FilterState { status: number | null; category: number | null; page: number; }

@Component({
  selector: 'app-tickets-list',
  standalone: true,
  imports: [NgIf, NgFor, ReactiveFormsModule, StatusBadgeComponent, SkeletonComponent, ToastContainerComponent],
  templateUrl: './tickets-list.component.html',
  styleUrls: ['./tickets-list.component.scss'],
})
export class TicketsListComponent implements OnInit, OnDestroy {
  private svc      = inject(SupportService);
  private router   = inject(Router);
  private destroy$ = new Subject<void>();

  searchCtrl    = new FormControl('');
  searchFocused = false;
  activeStatus: number | null = null;

  filter$ = new BehaviorSubject<FilterState>({ status: null, category: null, page: 1 });

  tickets: Ticket[] = [];
  pagination: Omit<PaginatedResponse<Ticket>, 'data'> | null = null;
  loading = false;
  error   = false;

  readonly PAGE_SIZE = 10;

  readonly statusChips = [
    { value: null, label: 'All' },
    { value: 1,    label: 'Open' },
    { value: 2,    label: 'In Progress' },
    { value: 3,    label: 'Awaiting Reply' },
    { value: 4,    label: 'Resolved' },
    { value: 5,    label: 'Closed' },
  ];

  readonly categoryCards = [
  {
    value: 1,
    icon: '🛠️',
    name: 'Technical',
    desc: 'Report bugs, errors, and technical issues'
  },
  {
    value: 2,
    icon: '👤',
    name: 'Account',
    desc: 'Manage your account settings and profile'
  },
  {
    value: 3,
    icon: '💳',
    name: 'Payment',
    desc: 'Billing, invoices, and payment-related questions'
  },
  {
    value: 4,
    icon: '📦',
    name: 'Product',
    desc: 'Product information, features, and usage support'
  },
  {
    value: 5,
    icon: '🔒',
    name: 'Security',
    desc: 'Passwords, privacy, and account protection'
  },
  {
    value: 6,
    icon: '🏢',
    name: 'Other',
    desc: 'General inquiries and miscellaneous requests'
  },
  {
    value: 7,
    icon: '🤝',
    name: 'Supplier',
    desc: 'Supplier onboarding, management, and support'
  }
];

  readonly skeletonRows = [0, 1, 2, 3];

  private readonly iconMap: Record<string, string> = {
    'Account': '👤', 'Billing': '💳', 'Payments': '💳', 'Technical': '⚙️',
    'Orders': '📦', 'Security': '🔒', 'Business': '🏢', 'General': '💬',
    'Getting': '🚀',
  };

  categoryIcon(cat: string): string {
    const key = Object.keys(this.iconMap).find(k => cat.includes(k));
    return key ? this.iconMap[key] : '🎫';
  }

  ngOnInit(): void {
    const search$ = this.searchCtrl.valueChanges.pipe(
      startWith(''), debounceTime(350), distinctUntilChanged(),
    );

    combineLatest([this.filter$, search$]).pipe(
      switchMap(([f, search]) => {
        this.loading = true; this.error = false;
        return this.svc.getTickets({
          pageNumber: f.page, pageSize: this.PAGE_SIZE,
          status: f.status, category: f.category, search: search ?? '',
        }).pipe(catchError(() => { this.error = true; return of(null); }));
      }),
      takeUntil(this.destroy$),
    ).subscribe(res => {
      this.loading = false;
      if (res) {
        this.tickets    = res.data;
        const { data: _, ...rest } = res;
        this.pagination = rest;
      }
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  setStatus(value: number | null): void {
    this.activeStatus = value;
    this.filter$.next({ ...this.filter$.value, status: value, page: 1 });
  }

  setCategory(value: number | null): void {
    this.filter$.next({ ...this.filter$.value, category: value, page: 1 });
  }

  goToPage(page: number): void { this.filter$.next({ ...this.filter$.value, page }); }

  openTicket(id: string): void  { this.router.navigate(['/businessowner/tickets', id]); }
  createTicket(): void          { this.router.navigate(['/businessowner/tickets/create']); }

  get pages(): number[] {
    if (!this.pagination) return [];
    return Array.from({ length: this.pagination.totalPages }, (_, i) => i + 1);
  }
}