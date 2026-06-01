import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import {
  AdminUserManagementService,
  BusinessOwnerListItem,
  BusinessOwnerDetails,
  CustomerListItem,
  CustomerDetails,
  BusinessOwnerFilterParams,
  CustomerFilterParams,
  SuspendDto,
  BanDto,
  BlockDto,
  ActionLog,
  PaginatedResponse,
} from '../../core/services/admi-user-management.service';

export const ACCOUNT_STATUS: Record<number, { label: string; badge: string }> = {
  1: { label: 'Active',    badge: 'badge-active'    },
  2: { label: 'Suspended', badge: 'badge-suspended' },
  3: { label: 'Banned',    badge: 'badge-banned'    },
  4: { label: 'Blocked',   badge: 'badge-blocked'   },
};

export const APPROVAL_STATUS: Record<number, { label: string; badge: string }> = {
  1: { label: 'Pending',  badge: 'badge-pending' },
  2: { label: 'Approved', badge: 'badge-active'  },
  3: { label: 'Rejected', badge: 'badge-banned'  },
};

export function getInitials(name: string): string {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

const AVATAR_CLASSES = ['av-gold', 'av-blue', 'av-green', 'av-red'];
export function avatarClass(id: string): string {
  let hash = 0;
  for (const c of id) hash += c.charCodeAt(0);
  return AVATAR_CLASSES[hash % AVATAR_CLASSES.length];
}

@Component({
  selector: 'app-admin-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-user-management.component.html',
  styleUrls: ['./admin-user-management.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class AdminUserManagementComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();
  private searchChange$ = new Subject<string>();

  activeTab: 'bo' | 'cu' = 'bo';
  isLoading = false;
  errorMsg: string | null = null;

  // ─── Business Owner state ───
  businessOwners: BusinessOwnerListItem[] = [];
  boPagination: Omit<PaginatedResponse<unknown>, 'data'> = {
    pageIndex: 1, pageSize: 20, count: 0,
    totalPages: 0, hasPrevious: false, hasNext: false,
    firstItemIndex: 0, lastItemIndex: 0,
  };
  boFilters: BusinessOwnerFilterParams = { pageIndex: 1, pageSize: 20 };

  // ─── Customer state ───
  customers: CustomerListItem[] = [];
  cuPagination: Omit<PaginatedResponse<unknown>, 'data'> = {
    pageIndex: 1, pageSize: 20, count: 0,
    totalPages: 0, hasPrevious: false, hasNext: false,
    firstItemIndex: 0, lastItemIndex: 0,
  };
  cuFilters: CustomerFilterParams = { pageIndex: 1, pageSize: 20 };

  // ─── Modal state ───
  isModalOpen   = false;
  isModalLoading = false;
  modalType: 'bo' | 'cu' = 'bo';
  selectedBO: BusinessOwnerDetails | null = null;
  selectedCustomer: CustomerDetails | null = null;   // ← CustomerDetails not CustomerListItem

  // ─── Filter state ───
  searchText     = '';
  statusFilter   = '';
  categoryFilter = '';
  dateFrom       = '';
  dateTo         = '';

  stats = { businessOwners: 0, customers: 0, suspended: 0, banned: 0 };

  ACCOUNT_STATUS  = ACCOUNT_STATUS;
  APPROVAL_STATUS = APPROVAL_STATUS;
  getInitials     = getInitials;
  avatarClass     = avatarClass;

  constructor(private svc: AdminUserManagementService) {}

  ngOnInit(): void {
    this.searchChange$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.resetAndLoad());
    this.loadBO();
    this.loadCustomers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  switchTab(tab: 'bo' | 'cu'): void {
    this.activeTab = tab;
    this.clearFilters();
  }

  onSearchChange(value: string): void {
    this.searchText = value;
    this.searchChange$.next(value);
  }

  applyFilters(): void { this.resetAndLoad(); }

  clearFilters(): void {
    this.searchText = ''; this.statusFilter = '';
    this.categoryFilter = ''; this.dateFrom = ''; this.dateTo = '';
    this.resetAndLoad();
  }

  private resetAndLoad(): void {
    if (this.activeTab === 'bo') {
      this.boFilters.pageIndex = 1; this.loadBO();
    } else {
      this.cuFilters.pageIndex = 1; this.loadCustomers();
    }
  }

  // ─── Load Lists ───

  loadBO(): void {
    this.isLoading = true;
    this.errorMsg  = null;
    const params: BusinessOwnerFilterParams = {
      ...this.boFilters,
      searchQuery:          this.searchText   || undefined,
      accountStatus:        this.statusFilter ? (Number(this.statusFilter) as 1|2|3|4) : undefined,
      category:             this.categoryFilter || undefined,
      registrationDateFrom: this.dateFrom     || undefined,
      registrationDateTo:   this.dateTo       || undefined,
    };
    this.svc.getBusinessOwners(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.businessOwners = res.data.data;
            const { data: _, ...pag } = res.data;
            this.boPagination        = pag;
            this.stats.businessOwners = res.data.count;
            this.stats.suspended      = this.businessOwners.filter(b => b.isSuspended).length;
            this.stats.banned         = this.businessOwners.filter(b => b.isBanned).length;
          } else { this.errorMsg = res.message ?? 'Failed to load business owners.'; }
          this.isLoading = false;
        },
        error: (err) => { this.errorMsg = err.message ?? 'Network error.'; this.isLoading = false; },
      });
  }

  loadCustomers(): void {
    const params: CustomerFilterParams = {
      ...this.cuFilters,
      searchQuery:          this.searchText   || undefined,
      accountStatus:        this.statusFilter ? (Number(this.statusFilter) as 1|2|3|4) : undefined,
      registrationDateFrom: this.dateFrom     || undefined,
      registrationDateTo:   this.dateTo       || undefined,
    };
    this.svc.getCustomers(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.customers    = res.data.data;
            const { data: _, ...pag } = res.data;
            this.cuPagination = pag;
            this.stats.customers = res.data.count;
          } else { this.errorMsg = res.message ?? 'Failed to load customers.'; }
        },
        error: (err) => { this.errorMsg = err.message; },
      });
  }

  get boPages(): number[] {
    return Array.from({ length: Math.min(this.boPagination.totalPages, 5) }, (_, i) => i + 1);
  }
  get cuPages(): number[] {
    return Array.from({ length: Math.min(this.cuPagination.totalPages, 5) }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (this.activeTab === 'bo') {
      this.boFilters.pageIndex = page; this.loadBO();
    } else {
      this.cuFilters.pageIndex = page; this.loadCustomers();
    }
  }

  // ─── Modal: Business Owner ───

  openBOModal(userId: string): void {
    this.modalType      = 'bo';
    this.isModalOpen    = true;
    this.selectedBO     = null;
    this.selectedCustomer = null;
    this.isModalLoading = true;
    this.svc.getBusinessOwnerById(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:  (res) => { if (res.success) this.selectedBO = res.data; this.isModalLoading = false; },
        error: ()    => { this.isModalLoading = false; },
      });
  }

  // ─── Modal: Customer ───
  // مثل الـ BO بالظبط — بنجيب CustomerDetails من الـ API

  openCustomerModal(cu: CustomerListItem): void {
    this.modalType      = 'cu';
    this.isModalOpen    = true;
    this.selectedBO     = null;
    this.selectedCustomer = null;
    this.isModalLoading = true;
    this.svc.getCustomerById(cu.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:  (res) => { if (res.success) this.selectedCustomer = res.data; this.isModalLoading = false; },
        error: ()    => { this.isModalLoading = false; },
      });
  }

  closeModal(): void {
    this.isModalOpen    = false;
    this.selectedBO     = null;
    this.selectedCustomer = null;
  }

  // ─── BO Table Actions ───

  onSuspend(bo: BusinessOwnerListItem, event: Event): void {
    event.stopPropagation();
    const reason = prompt(`Suspend "${bo.ownerName}"?\nEnter reason (min 10 chars):`);
    if (!reason || reason.length < 10) return;
    this.svc.suspendBusinessOwner({ userId: bo.id, reason })
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: () => this.loadBO(), error: (e) => alert(e.message) });
  }

  onUnsuspend(bo: BusinessOwnerListItem, event: Event): void {
    event.stopPropagation();
    if (!confirm(`Lift suspension for "${bo.ownerName}"?`)) return;
    this.svc.unsuspendBusinessOwner(bo.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: () => this.loadBO(), error: (e) => alert(e.message) });
  }

  onBan(bo: BusinessOwnerListItem, event: Event): void {
    event.stopPropagation();
    const reason = prompt(`Permanently ban "${bo.ownerName}"?\nEnter reason:`);
    if (!reason) return;
    this.svc.banBusinessOwner({ userId: bo.id, reason, isPermanent: true })
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: () => this.loadBO(), error: (e) => alert(e.message) });
  }

  onBlockBO(bo: BusinessOwnerListItem, event: Event): void {
    event.stopPropagation();
    const reason = prompt(`Block "${bo.ownerName}"?\nEnter reason (min 10 chars):`);
    if (!reason || reason.length < 10) return;
    this.svc.blockBusinessOwner({ userId: bo.id, reason })
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: () => this.loadBO(), error: (e) => alert(e.message) });
  }

  onUnblockBO(bo: BusinessOwnerListItem, event: Event): void {
    event.stopPropagation();
    if (!confirm(`Unblock "${bo.ownerName}"?`)) return;
    this.svc.unblockBusinessOwner(bo.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: () => this.loadBO(), error: (e) => alert(e.message) });
  }

  // ─── BO Modal Actions ───

  modalSuspend(): void {
    if (!this.selectedBO) return;
    const reason = prompt(`Suspend "${this.selectedBO.displayName}"?\nEnter reason (min 10 chars):`);
    if (!reason || reason.length < 10) return;
    this.svc.suspendBusinessOwner({ userId: this.selectedBO.id, reason })
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: () => { this.openBOModal(this.selectedBO!.id); this.loadBO(); } });
  }

  modalUnsuspend(): void {
    if (!this.selectedBO) return;
    this.svc.unsuspendBusinessOwner(this.selectedBO.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: () => { this.openBOModal(this.selectedBO!.id); this.loadBO(); } });
  }

  modalBlock(): void {
    if (!this.selectedBO) return;
    const reason = prompt('Block reason (min 10 chars):');
    if (!reason || reason.length < 10) return;
    this.svc.blockBusinessOwner({ userId: this.selectedBO.id, reason })
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: () => { this.openBOModal(this.selectedBO!.id); this.loadBO(); } });
  }

  modalUnblock(): void {
    if (!this.selectedBO) return;
    this.svc.unblockBusinessOwner(this.selectedBO.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: () => { this.openBOModal(this.selectedBO!.id); this.loadBO(); } });
  }

  modalBan(): void {
    if (!this.selectedBO) return;
    const reason = prompt(`Permanently ban "${this.selectedBO.displayName}"?\nEnter reason:`);
    if (!reason) return;
    this.svc.banBusinessOwner({ userId: this.selectedBO.id, reason, isPermanent: true })
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: () => { this.openBOModal(this.selectedBO!.id); this.loadBO(); } });
  }

  // ─── Customer Table Actions ───

  onBlockCustomer(cu: CustomerListItem, event: Event): void {
    event.stopPropagation();
    if (cu.isBlocked) {
      if (!confirm(`Unblock "${cu.name}"?`)) return;
      this.svc.unblockCustomer(cu.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({ next: () => this.loadCustomers(), error: (e) => alert(e.message) });
    } else {
      const reason = prompt(`Block "${cu.name}"?\nEnter reason (min 10 chars):`);
      if (!reason || reason.length < 10) return;
      this.svc.blockCustomer({ userId: cu.id, reason })
        .pipe(takeUntil(this.destroy$))
        .subscribe({ next: () => this.loadCustomers(), error: (e) => alert(e.message) });
    }
  }

  onDeleteCustomer(cu: CustomerListItem, event: Event): void {
    event.stopPropagation();
    if (!confirm(`Permanently delete "${cu.name}"?\nThis cannot be undone.`)) return;
    this.svc.deleteCustomer(cu.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:  () => { this.loadCustomers(); this.stats.customers = Math.max(0, this.stats.customers - 1); },
        error: () => { this.errorMsg = `Cannot delete "${cu.name}". This customer may have existing orders or data linked to their account.`; },
      });
  }

  // ─── Customer Modal Actions ───

  modalBlockCustomer(): void {
    if (!this.selectedCustomer) return;
    const reason = prompt(`Block "${this.selectedCustomer.name}"?\nEnter reason (min 10 chars):`);
    if (!reason || reason.length < 10) return;
    this.svc.blockCustomer({ userId: this.selectedCustomer.id, reason })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:  () => { this.openCustomerModalById(this.selectedCustomer!.id); this.loadCustomers(); },
        error: (e) => alert(e.message),
      });
  }

  modalUnblockCustomer(): void {
    if (!this.selectedCustomer) return;
    if (!confirm(`Unblock "${this.selectedCustomer.name}"?`)) return;
    this.svc.unblockCustomer(this.selectedCustomer.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:  () => { this.openCustomerModalById(this.selectedCustomer!.id); this.loadCustomers(); },
        error: (e) => alert(e.message),
      });
  }

  modalDeleteCustomer(): void {
    if (!this.selectedCustomer) return;
    if (!confirm(`Permanently delete "${this.selectedCustomer.name}"?\nThis cannot be undone.`)) return;
    this.svc.deleteCustomer(this.selectedCustomer.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:  () => { this.closeModal(); this.loadCustomers(); this.stats.customers = Math.max(0, this.stats.customers - 1); },
        error: () => { this.errorMsg = `Cannot delete "${this.selectedCustomer?.name}". This customer may have existing orders or data linked to their account.`; },
      });
  }

  // helper — reload modal after action
  private openCustomerModalById(id: string): void {
    this.isModalLoading = true;
    this.svc.getCustomerById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:  (res) => { if (res.success) this.selectedCustomer = res.data; this.isModalLoading = false; },
        error: ()    => { this.isModalLoading = false; },
      });
  }
}