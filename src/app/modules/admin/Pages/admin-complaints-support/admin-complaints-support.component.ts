import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import {
  AdminComplaintService,
  ComplaintListItem,
  ComplaintFilterParams,
  ResolveComplaintDto,
  COMPLAINT_STATUS,
  VIOLATION_TYPE,
} from '../../core/services/admin-complaint.service';

import {
  AdminSupportService,
  SupportTicketListItem,
  TicketFilterParams,
  UpdateTicketStatusDto,
  AssignTicketDto,
  TICKET_STATUS,
  TICKET_PRIORITY,
} from '../../core/services/admin-support.service';

import { AdminService, AdminDto } from '../../core/services/admin.service';
import { PaginatedResponse } from '../../core/Interfaces/ibusiness-owner';

@Component({
  selector: 'app-admin-complaints-support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-complaints-support.component.html',
  styleUrls: ['./admin-complaints-support.component.css'],
})
export class AdminComplaintsSupportComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();
  private searchChange$ = new Subject<string>();

  activeTab: 'complaints' | 'tickets' = 'complaints';
  isLoading = false;
  errorMsg: string | null = null;

  COMPLAINT_STATUS = COMPLAINT_STATUS;
  VIOLATION_TYPE   = VIOLATION_TYPE;
  TICKET_STATUS    = TICKET_STATUS;
  TICKET_PRIORITY  = TICKET_PRIORITY;

  // ── Complaints ─────────────────────────────────────────────────────────────
  complaints: ComplaintListItem[] = [];
  complaintPagination: Omit<PaginatedResponse<unknown>, 'data'> = {
    pageIndex: 1, pageSize: 20, count: 0,
    totalPages: 0, hasPrevious: false, hasNext: false,
    firstItemIndex: 0, lastItemIndex: 0,
  };
  complaintFilters: ComplaintFilterParams = { pageIndex: 1, pageSize: 20 };

  isComplaintModalOpen = false;
  isRejectModalOpen    = false;
  selectedComplaint: ComplaintListItem | null = null;
  resolveText  = '';
  adminNotes   = '';
  blockUser    = false;
  rejectReason = '';

  // ── Support Tickets ────────────────────────────────────────────────────────
  tickets: SupportTicketListItem[] = [];
  ticketPagination: Omit<PaginatedResponse<unknown>, 'data'> = {
    pageIndex: 1, pageSize: 20, count: 0,
    totalPages: 0, hasPrevious: false, hasNext: false,
    firstItemIndex: 0, lastItemIndex: 0,
  };
  ticketFilters: TicketFilterParams = { pageIndex: 1, pageSize: 20 };

  isTicketModalOpen   = false;
  selectedTicket: SupportTicketListItem | null = null;
  activeModalSection: 'status' | 'priority' | 'assign' = 'status';
  ticketNewStatus: 1|2|3|4|5 = 1;
  ticketStatusNote    = '';
  ticketNewPriority: 1|2|3|4 = 1;
  ticketAssignAdminId = '';

  searchText      = '';
  statusFilter    = '';
  violationFilter = '';
  priorityFilter  = '';

  stats = { totalComplaints: 0, pendingComplaints: 0, openTickets: 0, unreadTickets: 0 };
  admins: AdminDto[] = [];

  violationTypes   = Object.entries(VIOLATION_TYPE).map(([k, v]) => ({ value: Number(k), label: v }));
  ticketStatuses   = Object.entries(TICKET_STATUS).map(([k, v]) => ({ value: Number(k), label: v.label }));
  ticketPriorities = Object.entries(TICKET_PRIORITY).map(([k, v]) => ({ value: Number(k), label: v.label }));

  constructor(
    private complaintSvc: AdminComplaintService,
    private supportSvc: AdminSupportService,
    private adminService: AdminService,
  ) {}

  ngOnInit(): void {
    this.searchChange$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.resetAndLoad());
    this.loadComplaints();
    this.loadTickets();
    this.loadAdmins();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAdmins(): void {
    this.adminService.getAllAdmins()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => { if (res.success) this.admins = res.data.filter(a => a.isActive); },
        error: () => {},
      });
  }

  switchTab(tab: 'complaints' | 'tickets'): void {
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
    this.violationFilter = ''; this.priorityFilter = '';
    this.resetAndLoad();
  }

  private resetAndLoad(): void {
    if (this.activeTab === 'complaints') {
      this.complaintFilters.pageIndex = 1; this.loadComplaints();
    } else {
      this.ticketFilters.pageIndex = 1; this.loadTickets();
    }
  }

  loadComplaints(): void {
    this.isLoading = true;
    this.errorMsg  = null;
    const params: ComplaintFilterParams = {
      ...this.complaintFilters,
      status:        this.statusFilter    ? (Number(this.statusFilter)    as 1|2|3|4)       : undefined,
      violationType: this.violationFilter ? (Number(this.violationFilter) as 1|2|3|4|5|6|7) : undefined,
    };
    this.complaintSvc.getComplaints(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.complaints = res.data.data;
            const { data: _, ...pag } = res.data;
            this.complaintPagination     = pag;
            this.stats.totalComplaints   = res.data.count;
            this.stats.pendingComplaints = this.complaints.filter(c => c.status === 1).length;
          } else { this.errorMsg = res.message ?? 'Failed to load complaints.'; }
          this.isLoading = false;
        },
        error: (err) => { this.errorMsg = err.message; this.isLoading = false; },
      });
  }

  loadTickets(): void {
    const params: TicketFilterParams = {
      ...this.ticketFilters,
      status:   this.statusFilter   ? (Number(this.statusFilter)   as 1|2|3|4|5) : undefined,
      priority: this.priorityFilter ? (Number(this.priorityFilter) as 1|2|3|4)   : undefined,
    };
    this.supportSvc.getTickets(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.tickets = res.data.data;
            const { data: _, ...pag } = res.data;
            this.ticketPagination    = pag;
            this.stats.openTickets   = this.tickets.filter(t => t.status === 1).length;
            this.stats.unreadTickets = this.tickets.filter(t => t.hasUnreadMessages).length;
          } else { this.errorMsg = res.message ?? 'Failed to load tickets.'; }
        },
        error: (err) => { this.errorMsg = err.message; },
      });
  }

  get complaintPages(): number[] {
    return Array.from({ length: Math.min(this.complaintPagination.totalPages, 5) }, (_, i) => i + 1);
  }
  get ticketPages(): number[] {
    return Array.from({ length: Math.min(this.ticketPagination.totalPages, 5) }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (this.activeTab === 'complaints') {
      this.complaintFilters.pageIndex = page; this.loadComplaints();
    } else {
      this.ticketFilters.pageIndex = page; this.loadTickets();
    }
  }

  // ── Complaint Modal ────────────────────────────────────────────────────────

  openComplaintModal(c: ComplaintListItem): void {
    this.selectedComplaint    = c;
    this.resolveText          = '';
    this.adminNotes           = '';
    this.blockUser            = false;
    this.rejectReason         = '';
    this.isComplaintModalOpen = true;
  }

  closeComplaintModal(): void {
    this.isComplaintModalOpen = false;
    this.selectedComplaint    = null;
  }

  openRejectModal(c: ComplaintListItem): void {
    this.selectedComplaint = c;
    this.rejectReason      = '';
    this.isRejectModalOpen = true;
  }

  closeRejectModal(): void { this.isRejectModalOpen = false; }

  resolveComplaint(): void {
    if (!this.selectedComplaint) return;
    if (!this.resolveText || this.resolveText.length < 10) {
      alert('Resolution must be at least 10 characters.'); return;
    }
    const dto: ResolveComplaintDto = {
      complaintId: this.selectedComplaint.id,
      resolution:  this.resolveText,
      adminNotes:  this.adminNotes || undefined,
      blockUser:   this.blockUser,
    };
    this.complaintSvc.resolveComplaint(dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => { this.closeComplaintModal(); this.loadComplaints(); },
        error: (e) => { this.errorMsg = e.message; },
      });
  }

  rejectComplaint(): void {
    if (!this.selectedComplaint) return;
    if (!this.rejectReason.trim()) return;
    this.complaintSvc.rejectComplaint(this.selectedComplaint.id, this.rejectReason.trim())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => { this.closeRejectModal(); this.closeComplaintModal(); this.loadComplaints(); },
        error: (e) => { this.errorMsg = e.message; },
      });
  }

  // ── Ticket Modal ───────────────────────────────────────────────────────────

  openTicketModal(t: SupportTicketListItem, section: 'status' | 'priority' | 'assign' = 'status'): void {
    this.selectedTicket      = t;
    this.ticketNewStatus     = t.status;
    this.ticketNewPriority   = t.priority;
    this.ticketStatusNote    = '';
    this.ticketAssignAdminId = '';
    this.activeModalSection  = section;
    this.isTicketModalOpen   = true;
  }

  closeTicketModal(): void {
    this.isTicketModalOpen = false;
    this.selectedTicket    = null;
  }

  saveTicketChanges(): void {
    if (!this.selectedTicket) return;
    const id = this.selectedTicket.id;
    const calls: any[] = [];

    if (Number(this.ticketNewStatus) !== this.selectedTicket.status) {
      const dto: UpdateTicketStatusDto = {
        ticketId: id,
        status:   Number(this.ticketNewStatus),
        note:     this.ticketStatusNote || undefined,
      };
      calls.push(this.supportSvc.updateTicketStatus(dto));
    }

    if (Number(this.ticketNewPriority) !== this.selectedTicket.priority) {
      calls.push(this.supportSvc.updateTicketPriority(id, Number(this.ticketNewPriority) as 1|2|3|4));
    }

    if (this.ticketAssignAdminId) {
      const dto: AssignTicketDto = { ticketId: id, adminId: this.ticketAssignAdminId };
      calls.push(this.supportSvc.assignTicket(dto));
    }

    if (calls.length === 0) { this.closeTicketModal(); return; }

    let done = 0;
    calls.forEach(call => {
      call.pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          done++;
          if (done === calls.length) { this.closeTicketModal(); this.loadTickets(); }
        },
        error: (e: any) => { this.errorMsg = e.message; },
      });
    });
  }
}