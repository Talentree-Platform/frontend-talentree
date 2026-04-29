import { ToastrService } from 'ngx-toastr';
import { AdminService } from './../../../core/services/admin.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { TableComponent } from '../../../Components/table/table.component';
import { Subscription, finalize } from 'rxjs';
import { BusinessOwner } from '../../../core/Interfaces/ibusiness-owner';
import { PaginationComponent } from '../../../Components/pagination/pagination.component';
import { BoDetailsComponent } from '../bo-details/bo-details.component';
import { ApproveOwnerComponent, ApproveOwnerSubmitEvent } from '../approve-owner/approve-owner.component';
import { RejectOwnerComponent } from '../reject-owner/reject-owner.component';
import { FormsModule } from '@angular/forms';
import { TableColumnType, TableRowActionEvent } from '../../../Components/table/table-action.types';

export type PendingApprovalFilter = 'all' | 'auto' | 'manual';

@Component({
  selector: 'app-pending-bo',
  standalone: true,
  imports: [
    TableComponent,
    PaginationComponent,
    BoDetailsComponent,
    ApproveOwnerComponent,
    RejectOwnerComponent,
    FormsModule
  ],
  templateUrl: './pending-bo.component.html',
  styleUrl: './pending-bo.component.css'
})
export class PendingBoComponent implements OnInit, OnDestroy {
  private readonly subs = new Subscription();

  readonly tableColumnStyles: Record<string, string> = {
    ownerName: 'name-column',
    businessName: 'business-name',
    businessCategory: 'category-column'
  };

  readonly tableColumnTypes: Record<string, TableColumnType> = {
    ownerName: 'text',
    businessName: 'text',
    email: 'email',
    phoneNumber: 'phone',
    businessCategory: 'badge',
    submittedAt: 'date'
  };

  readonly tableBadgeColors: Record<string, string> = {
    'Fashion & Accessories': '#F8C8DC',
    Handmade: '#FFD6A5',
    'Natural & Beauty Products': '#CDEAC0'
  };

  pendingOwners: BusinessOwner[] = [];
  /** Filters table rows by auto vs manual approval (cards). */
  approvalFilter: PendingApprovalFilter = 'all';
  searchQuery = '';
  isLoadingPending = false;
  isApproveRequestPending = false;
  isRejectRequestPending = false;

  selectedBusinessOwner: BusinessOwner | null = null;
  isDetailsOpen = false;
  isApproveOpen = false;
  isRejectOpen = false;
  rejectionReason = '';

  hasNext = false;
  hasPrevious = false;
  pageIndex = 1;
  pageSize = 20;
  totalPages = 0;

  totalPendingOwners = 0;
  AutoApprovalOwners = 0;
  ManualApprovalOwners = 0;

  constructor(
    private readonly _AdminService: AdminService,
    private readonly _ToastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadPendingOwners();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  get filteredOwners(): BusinessOwner[] {
    let list = this.pendingOwners;

    if (this.approvalFilter === 'auto') {
      list = list.filter((o) => o.willAutoApprove === true);
    } else if (this.approvalFilter === 'manual') {
      list = list.filter((o) => o.willAutoApprove === false);
    }

    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter((o) =>
      [
        o.ownerName,
        o.businessName,
        o.email,
        o.phoneNumber,
        o.businessCategory
      ].some((f) => String(f ?? '').toLowerCase().includes(q))
    );
  }

  setApprovalFilter(filter: PendingApprovalFilter): void {
    this.approvalFilter = filter;
  }

  loadPendingOwners(): void {
    this.isLoadingPending = true;
    this.subs.add(
      this._AdminService
        .getPendingBusinessOwner({
          pageIndex: this.pageIndex,
          pageSize: this.pageSize
        })
        .pipe(finalize(() => (this.isLoadingPending = false)))
        .subscribe({
          next: (res) => {
            this.pendingOwners = res.data.data;
            this.hasNext = res.data.hasNext;
            this.hasPrevious = res.data.hasPrevious;
            this.totalPages = res.data.totalPages;
            this.pageIndex = res.data.pageIndex;
            this.totalPendingOwners = res.data.count;
            this.AutoApprovalOwners = res.data.data.filter((item) => item.willAutoApprove).length;
            this.ManualApprovalOwners = res.data.data.filter((item) => !item.willAutoApprove).length;
          },
          error: (err) => {
            console.error(err);
          }
        })
    );
  }

  handleEvent(event: TableRowActionEvent): void {
    const action = event.action;
    const row = event.row as unknown as BusinessOwner;

    this.selectedBusinessOwner = row;

    if (action === 'view') {
      this.isDetailsOpen = true;
    }

    if (action === 'approve') {
      this.isApproveOpen = true;
    }

    if (action === 'reject') {
      this.rejectionReason = '';
      this.isRejectOpen = true;
    }
  }

  closeModal(): void {
    this.isDetailsOpen = false;
    this.isApproveOpen = false;
    this.isRejectOpen = false;
    this.selectedBusinessOwner = null;
    this.rejectionReason = '';
  }

  onApprove(owner: BusinessOwner | null, note = ''): void {
    if (!owner?.profileId || this.isApproveRequestPending) return;

    this.isApproveRequestPending = true;
    this.subs.add(
      this._AdminService
        .ApproveOwner(owner.profileId, note)
        .pipe(finalize(() => (this.isApproveRequestPending = false)))
        .subscribe({
          next: (res) => {
            this.closeModal();
            this._ToastrService.success(res.message, 'Talentree', {
              timeOut: 2000,
              closeButton: true
            });
            this.loadPendingOwners();
          },
          error: (err) => {
            console.error(err);
            this._ToastrService.error(err.error?.message ?? 'Approval failed', 'Talentree', {
              timeOut: 2000,
              closeButton: true
            });
          }
        })
    );
  }

  onApproveFromModal(event: ApproveOwnerSubmitEvent): void {
    this.onApprove(this.selectedBusinessOwner, event.note);
  }

  onRejectReason(reason: string): void {
    this.rejectionReason = reason;
  }

  /** Opens reject modal from details view while keeping the selected owner. */
  openRejectModalFromDetails(owner: BusinessOwner | null): void {
    this.selectedBusinessOwner = owner;
    this.rejectionReason = '';
    this.isDetailsOpen = false;
    this.isRejectOpen = true;
  }

  onReject(owner: BusinessOwner | null): void {
    if (!owner?.profileId || this.isRejectRequestPending) return;

    const rejectionReason = this.rejectionReason.trim();
    if (!rejectionReason) return;

    this.isRejectRequestPending = true;
    this.subs.add(
      this._AdminService
        .rejectOwner(owner.profileId, rejectionReason)
        .pipe(finalize(() => (this.isRejectRequestPending = false)))
        .subscribe({
          next: (res) => {
            this._ToastrService.error(res.message, 'Talentree', { timeOut: 2000, closeButton: true });
            this.closeModal();
            this.loadPendingOwners();
          },
          error: (err: { error?: { message?: string } }) => {
            console.error(err);
            this._ToastrService.error(err.error?.message ?? 'Reject failed', 'Talentree', {
              timeOut: 2000,
              closeButton: true
            });
          }
        })
    );
  }

  pageChangeEvent(page: number): void {
    this.pageIndex = page;
    this.loadPendingOwners();
  }
}
