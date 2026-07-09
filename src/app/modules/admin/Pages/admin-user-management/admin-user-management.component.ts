import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { ModalComponent } from '../../Components/modal/modal.component';
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
} from '../../core/services/admin-user-management.service';

interface PaginationState {
  pageIndex: number;
  pageSize: number;
  count: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  firstItemIndex: number;
  lastItemIndex: number;
}

export const ACCOUNT_STATUS: Record<number, { label: string; badge: string }> = {
  1: { label: 'Active', badge: 'badge-active' },
  2: { label: 'Suspended', badge: 'badge-suspended' },
  3: { label: 'Banned', badge: 'badge-banned' },
  4: { label: 'Blocked', badge: 'badge-blocked' },
};

export const APPROVAL_STATUS: Record<number, { label: string; badge: string }> = {
  1: { label: 'Pending', badge: 'badge-pending' },
  2: { label: 'Approved', badge: 'badge-active' },
  3: { label: 'Rejected', badge: 'badge-banned' },
};

export function getInitials(name: any): string {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).map(w => w ? w[0] : '').join('').toUpperCase() || '?';
}

const AVATAR_CLASSES = ['av-gold', 'av-blue', 'av-green', 'av-red'];
export function avatarClass(id: any): string {
  if (!id || typeof id !== 'string') return 'av-gold';
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash += id.charCodeAt(i);
  }
  return AVATAR_CLASSES[hash % AVATAR_CLASSES.length];
}

@Component({
  selector: 'app-admin-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './admin-user-management.component.html',
  styleUrls: ['./admin-user-management.component.css'],
})
export class AdminUserManagementComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();
  private searchChange$ = new Subject<string>();

  activeTab: 'bo' | 'cu' = 'bo';
  isLoading = false;
  errorMsg: string | null = null;

  // ─── Business Owner state ───
  businessOwners: BusinessOwnerListItem[] = [];
  boPagination: PaginationState = {
    pageIndex: 1, pageSize: 20, count: 0,
    totalPages: 0, hasPrevious: false, hasNext: false,
    firstItemIndex: 0, lastItemIndex: 0,
  };
  boFilters: BusinessOwnerFilterParams = { pageIndex: 1, pageSize: 20 };

  // ─── Customer state ───
  customers: CustomerListItem[] = [];
  cuPagination: PaginationState = {
    pageIndex: 1, pageSize: 20, count: 0,
    totalPages: 0, hasPrevious: false, hasNext: false,
    firstItemIndex: 0, lastItemIndex: 0,
  };
  cuFilters: CustomerFilterParams = { pageIndex: 1, pageSize: 20 };

  // ─── Modal state ───
  isModalOpen = false;
  isModalLoading = false;
  modalType: 'bo' | 'cu' = 'bo';
  selectedBO: BusinessOwnerDetails | null = null;
  selectedCustomer: CustomerDetails | null = null;   // ← CustomerDetails not CustomerListItem

  // ─── Filter state ───
  searchText = '';
  statusFilter = '';
  categoryFilter = '';
  dateFrom = '';
  dateTo = '';

  stats = { businessOwners: 0, customers: 0, suspended: 0, banned: 0 };

  // ─── Reusable Modal state ───
  dialogOpen = false;
  dialogTitle = '';
  dialogMessage = '';
  dialogIsConfirm = false;
  dialogIsPrompt = false;
  dialogPromptPlaceholder = '';
  dialogMinLength = 0;
  dialogConfirmText = 'Confirm';
  dialogDanger = false;
  dialogCallback: (val?: string) => void = () => {};

  openDialog(options: {
    title: string;
    message?: string;
    isConfirm?: boolean;
    isPrompt?: boolean;
    promptPlaceholder?: string;
    minLength?: number;
    confirmText?: string;
    danger?: boolean;
    callback: (val?: string) => void;
  }): void {
    this.dialogTitle = options.title;
    this.dialogMessage = options.message ?? '';
    this.dialogIsConfirm = options.isConfirm ?? false;
    this.dialogIsPrompt = options.isPrompt ?? false;
    this.dialogPromptPlaceholder = options.promptPlaceholder ?? 'Enter reason...';
    this.dialogMinLength = options.minLength ?? 0;
    this.dialogConfirmText = options.confirmText ?? 'Confirm';
    this.dialogDanger = options.danger ?? false;
    this.dialogCallback = options.callback;
    this.dialogOpen = true;
  }

  onDialogConfirm(value?: string | void): void {
    this.dialogOpen = false;
    if (this.dialogIsPrompt) {
      this.dialogCallback(value as string);
    } else {
      this.dialogCallback();
    }
  }

  onDialogClose(): void {
    this.dialogOpen = false;
  }

  ACCOUNT_STATUS = ACCOUNT_STATUS;
  APPROVAL_STATUS = APPROVAL_STATUS;
  getInitials = getInitials;
  avatarClass = avatarClass;

  safeNumber(val: any): number {
    if (val === null || val === undefined) return 0;
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  }

  constructor(private svc: AdminUserManagementService) { }

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
    this.errorMsg = null;
    const params: BusinessOwnerFilterParams = {
      ...this.boFilters,
      searchQuery: this.searchText || undefined,
      accountStatus: this.statusFilter ? (Number(this.statusFilter) as 1 | 2 | 3 | 4) : undefined,
      category: this.categoryFilter || undefined,
      registrationDateFrom: this.dateFrom || undefined,
      registrationDateTo: this.dateTo || undefined,
    };
    this.svc.getBusinessOwners(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.businessOwners = res.data.data;
            const { data: _, ...pag } = res.data;
            this.boPagination = pag;
            this.stats.businessOwners = res.data.count;
            this.stats.suspended = this.businessOwners.filter(b => b.isSuspended).length;
            this.stats.banned = this.businessOwners.filter(b => b.isBanned).length;
          } else { this.errorMsg = res.message ?? 'Failed to load business owners.'; }
          this.isLoading = false;
        },
        error: (err) => { this.errorMsg = err.message ?? 'Network error.'; this.isLoading = false; },
      });
  }

  loadCustomers(): void {
    const params: CustomerFilterParams = {
      ...this.cuFilters,
      searchQuery: this.searchText || undefined,
      accountStatus: this.statusFilter ? (Number(this.statusFilter) as 1 | 2 | 3 | 4) : undefined,
      registrationDateFrom: this.dateFrom || undefined,
      registrationDateTo: this.dateTo || undefined,
    };
    this.svc.getCustomers(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.customers = res.data.data;
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
    this.modalType = 'bo';
    this.isModalOpen = true;
    this.selectedBO = null;
    this.selectedCustomer = null;
    this.isModalLoading = true;
    this.svc.getBusinessOwnerById(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          // Handle both ApiResponse wrapper and direct object from API
          if (res && typeof res === 'object') {
            if ('success' in res) {
              // Standard ApiResponse wrapper: { success: true, data: {...} }
              if (res.success && res.data) {
                this.selectedBO = res.data;
              }
            } else if ('id' in res) {
              // Direct object returned by API (no wrapper)
              this.selectedBO = res;
            }
          }
          this.isModalLoading = false;
        },
        error: (err) => {
          this.isModalLoading = false;
        },
      });
  }

  // ─── Modal: Customer ───
  // مثل الـ BO بالظبط — بنجيب CustomerDetails من الـ API

  openCustomerModal(cu: CustomerListItem): void {
    if (!cu || !cu.id) {
      return;
    }
    this.modalType = 'cu';
    this.isModalOpen = true;
    this.selectedBO = null;
    this.selectedCustomer = null;
    this.isModalLoading = true;
    this.svc.getCustomerById(cu.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          // Handle both ApiResponse wrapper and direct object from API
          if (res && typeof res === 'object') {
            if ('success' in res) {
              // Standard ApiResponse wrapper: { success: true, data: {...} }
              if (res.success && res.data) {
                this.selectedCustomer = res.data;
              }
            } else if ('id' in res) {
              // Direct object returned by API (no wrapper)
              this.selectedCustomer = res;
            }
          }
          this.isModalLoading = false;
        },
        error: (err) => {
          this.isModalLoading = false;
        },
      });
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedBO = null;
    this.selectedCustomer = null;
  }

  // ─── BO Table Actions ───

  onSuspend(bo: BusinessOwnerListItem, event: Event): void {
    event.stopPropagation();
    this.openDialog({
      title: `Suspend "${bo.ownerName}"?`,
      message: 'Please enter the suspension reason (minimum 10 characters):',
      isPrompt: true,
      minLength: 10,
      danger: true,
      confirmText: 'Suspend',
      callback: (reason) => {
        if (!reason) return;
        this.svc.suspendBusinessOwner({ userId: bo.id, reason })
          .pipe(takeUntil(this.destroy$))
          .subscribe({ next: () => this.loadBO(), error: (e) => alert(e.message) });
      }
    });
  }

  onUnsuspend(bo: BusinessOwnerListItem, event: Event): void {
    event.stopPropagation();
    this.openDialog({
      title: `Lift suspension for "${bo.ownerName}"?`,
      message: 'Are you sure you want to lift the suspension for this business owner?',
      isConfirm: true,
      callback: () => {
        this.svc.unsuspendBusinessOwner(bo.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({ next: () => this.loadBO(), error: (e) => alert(e.message) });
      }
    });
  }

  onBan(bo: BusinessOwnerListItem, event: Event): void {
    event.stopPropagation();
    this.openDialog({
      title: `Permanently ban "${bo.ownerName}"?`,
      message: 'Please enter the reason for this permanent ban:',
      isPrompt: true,
      danger: true,
      confirmText: 'Ban',
      callback: (reason) => {
        if (!reason) return;
        this.svc.banBusinessOwner({ userId: bo.id, reason, isPermanent: true })
          .pipe(takeUntil(this.destroy$))
          .subscribe({ next: () => this.loadBO(), error: (e) => alert(e.message) });
      }
    });
  }

  onBlockBO(bo: BusinessOwnerListItem, event: Event): void {
    event.stopPropagation();
    this.openDialog({
      title: `Block "${bo.ownerName}"?`,
      message: 'Please enter the block reason (minimum 10 characters):',
      isPrompt: true,
      minLength: 10,
      danger: true,
      confirmText: 'Block',
      callback: (reason) => {
        if (!reason) return;
        this.svc.blockBusinessOwner({ userId: bo.id, reason })
          .pipe(takeUntil(this.destroy$))
          .subscribe({ next: () => this.loadBO(), error: (e) => alert(e.message) });
      }
    });
  }

  onUnblockBO(bo: BusinessOwnerListItem, event: Event): void {
    event.stopPropagation();
    this.openDialog({
      title: `Unblock "${bo.ownerName}"?`,
      message: 'Are you sure you want to unblock this business owner?',
      isConfirm: true,
      callback: () => {
        this.svc.unblockBusinessOwner(bo.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({ next: () => this.loadBO(), error: (e) => alert(e.message) });
      }
    });
  }

  // ─── BO Modal Actions ───

  modalSuspend(): void {
    if (!this.selectedBO) return;
    this.openDialog({
      title: `Suspend "${this.selectedBO.displayName}"?`,
      message: 'Please enter the suspension reason (minimum 10 characters):',
      isPrompt: true,
      minLength: 10,
      danger: true,
      confirmText: 'Suspend',
      callback: (reason) => {
        if (!reason) return;
        this.svc.suspendBusinessOwner({ userId: this.selectedBO!.id, reason })
          .pipe(takeUntil(this.destroy$))
          .subscribe({ next: () => { this.openBOModal(this.selectedBO!.id); this.loadBO(); } });
      }
    });
  }

  modalBlock(): void {
    if (!this.selectedBO) return;
    this.openDialog({
      title: `Block "${this.selectedBO.displayName}"?`,
      message: 'Please enter the block reason (minimum 10 characters):',
      isPrompt: true,
      minLength: 10,
      danger: true,
      confirmText: 'Block',
      callback: (reason) => {
        if (!reason) return;
        this.svc.blockBusinessOwner({ userId: this.selectedBO!.id, reason })
          .pipe(takeUntil(this.destroy$))
          .subscribe({ next: () => { this.openBOModal(this.selectedBO!.id); this.loadBO(); } });
      }
    });
  }

  modalUnblock(): void {
    if (!this.selectedBO) return;
    this.svc.unblockBusinessOwner(this.selectedBO.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: () => { this.openBOModal(this.selectedBO!.id); this.loadBO(); } });
  }

  modalBan(): void {
    if (!this.selectedBO) return;
    this.openDialog({
      title: `Permanently ban "${this.selectedBO.displayName}"?`,
      message: 'Please enter the reason for this permanent ban:',
      isPrompt: true,
      danger: true,
      confirmText: 'Ban',
      callback: (reason) => {
        if (!reason) return;
        this.svc.banBusinessOwner({ userId: this.selectedBO!.id, reason, isPermanent: true })
          .pipe(takeUntil(this.destroy$))
          .subscribe({ next: () => { this.openBOModal(this.selectedBO!.id); this.loadBO(); } });
      }
    });
  }

  modalUnsuspend(): void {
    if (!this.selectedBO) return;
    this.openDialog({
      title: `Lift suspension for "${this.selectedBO.displayName}"?`,
      message: 'Are you sure you want to lift the suspension for this business owner?',
      isConfirm: true,
      callback: () => {
        this.svc.unsuspendBusinessOwner(this.selectedBO!.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => { this.openBOModal(this.selectedBO!.id); this.loadBO(); },
            error: (e: any) => alert(e?.error?.message ?? 'Failed to unsuspend.'),
          });
      }
    });
  }

  // ─── Customer Table Actions ───

  onBlockCustomer(cu: CustomerListItem, event: Event): void {
    event.stopPropagation();
    if (cu.isBlocked) {
      this.openDialog({
        title: `Unblock "${cu.name}"?`,
        message: 'Are you sure you want to unblock this customer?',
        isConfirm: true,
        callback: () => {
          this.svc.unblockCustomer(cu.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({ next: () => this.loadCustomers(), error: (e) => alert(e.message) });
        }
      });
    } else {
      this.openDialog({
        title: `Block "${cu.name}"?`,
        message: 'Please enter the block reason (minimum 10 characters):',
        isPrompt: true,
        minLength: 10,
        danger: true,
        confirmText: 'Block',
        callback: (reason) => {
          if (!reason) return;
          this.svc.blockCustomer({ userId: cu.id, reason })
            .pipe(takeUntil(this.destroy$))
            .subscribe({ next: () => this.loadCustomers(), error: (e) => alert(e.message) });
        }
      });
    }
  }

  onDeleteCustomer(cu: CustomerListItem, event: Event): void {
    event.stopPropagation();
    this.openDialog({
      title: `Permanently delete "${cu.name}"?`,
      message: 'Are you sure you want to permanently delete this customer?<br><strong>This cannot be undone.</strong>',
      isConfirm: true,
      danger: true,
      confirmText: 'Delete',
      callback: () => {
        this.svc.deleteCustomer(cu.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => { this.loadCustomers(); this.stats.customers = Math.max(0, this.stats.customers - 1); },
            error: () => { this.errorMsg = `Cannot delete "${cu.name}". This customer may have existing orders or data linked to their account.`; },
          });
      }
    });
  }

  onDeactivateCustomer(cu: CustomerListItem, event: Event): void {
    event.stopPropagation();
    this.openDialog({
      title: `Deactivate "${cu.name}"?`,
      message: 'Are you sure you want to deactivate this customer account?',
      isConfirm: true,
      danger: true,
      confirmText: 'Deactivate',
      callback: () => {
        this.svc.deactivateCustomer(cu.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => { this.loadCustomers(); },
            error: (e) => alert(e.message || 'Failed to deactivate customer.')
          });
      }
    });
  }

  // ─── Customer Modal Actions ───

  modalBlockCustomer(): void {
    if (!this.selectedCustomer) return;
    this.openDialog({
      title: `Block "${this.selectedCustomer.name}"?`,
      message: 'Please enter the block reason (minimum 10 characters):',
      isPrompt: true,
      minLength: 10,
      danger: true,
      confirmText: 'Block',
      callback: (reason) => {
        if (!reason) return;
        this.svc.blockCustomer({ userId: this.selectedCustomer!.id, reason })
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => { this.openCustomerModalById(this.selectedCustomer!.id); this.loadCustomers(); },
            error: (e) => alert(e.message),
          });
      }
    });
  }

  modalUnblockCustomer(): void {
    if (!this.selectedCustomer) return;
    this.openDialog({
      title: `Unblock "${this.selectedCustomer.name}"?`,
      message: 'Are you sure you want to unblock this customer?',
      isConfirm: true,
      callback: () => {
        this.svc.unblockCustomer(this.selectedCustomer!.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => { this.openCustomerModalById(this.selectedCustomer!.id); this.loadCustomers(); },
            error: (e) => alert(e.message),
          });
      }
    });
  }

  modalDeleteCustomer(): void {
    if (!this.selectedCustomer) return;
    this.openDialog({
      title: `Permanently delete "${this.selectedCustomer.name}"?`,
      message: 'Are you sure you want to permanently delete this customer?<br><strong>This cannot be undone.</strong>',
      isConfirm: true,
      danger: true,
      confirmText: 'Delete',
      callback: () => {
        this.svc.deleteCustomer(this.selectedCustomer!.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => { this.closeModal(); this.loadCustomers(); this.stats.customers = Math.max(0, this.stats.customers - 1); },
            error: () => { this.errorMsg = `Cannot delete "${this.selectedCustomer?.name}". This customer may have existing orders or data linked to their account.`; },
          });
      }
    });
  }

  modalDeactivateCustomer(): void {
    if (!this.selectedCustomer) return;
    this.openDialog({
      title: `Deactivate "${this.selectedCustomer.name}"?`,
      message: 'Are you sure you want to deactivate this customer account?',
      isConfirm: true,
      danger: true,
      confirmText: 'Deactivate',
      callback: () => {
        this.svc.deactivateCustomer(this.selectedCustomer!.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.openCustomerModalById(this.selectedCustomer!.id);
              this.loadCustomers();
            },
            error: (e) => alert(e.message || 'Failed to deactivate customer.')
          });
      }
    });
  }

  // helper — reload modal after action
  private openCustomerModalById(id: string): void {
    this.isModalLoading = true;
    this.svc.getCustomerById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          if (res && typeof res === 'object') {
            if ('success' in res) {
              if (res.success && res.data) {
                this.selectedCustomer = res.data;
              }
            } else if ('id' in res) {
              this.selectedCustomer = res;
            }
          }
          this.isModalLoading = false;
        },
        error: (err) => {
          this.isModalLoading = false;
        },
      });
  }
}