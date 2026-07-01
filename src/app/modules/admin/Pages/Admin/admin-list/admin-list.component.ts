import { ToastrService } from 'ngx-toastr';
import { AdminManagementService, AdminDto } from '../../../core/services/adminManagment.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { TableComponent } from '../../../Components/table/table.component';
import { TitleCasePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { CreateAdminComponent } from '../create-admin/create-admin.component';
import { CommonModule } from '@angular/common';  // Add this import


@Component({
  selector: 'app-admin-list',
  standalone: true,
  imports: [TableComponent, TitleCasePipe, CreateAdminComponent, CommonModule],
  templateUrl: './admin-list.component.html',
  styleUrl: './admin-list.component.css'
})
export class AdminListComponent implements OnInit, OnDestroy {

  constructor(
    private _AdminManagmentService: AdminManagementService,
    private _ToastrService: ToastrService
  ) { }

  adminSub!: Subscription;
  actionSub!: Subscription;

  // table data
  admins: AdminDto[] = [];

  // selected admin
  selectedAdmin: AdminDto | null = null;

  // modals
  isCreateOpen = false;

  // stats
  totalAdmins = 0;
  activeAdmins = 0;
  inactiveAdmins = 0;

  // table config
  columns = ['fullName', 'email', 'phoneNumber', 'createdAt', 'isActive'];
  actions = ['deactivate', 'reactivate'];

  ngOnInit(): void {
    this.loadAdmins();
  }

  loadAdmins(): void {
    this.adminSub = this._AdminManagmentService.getAllAdmins().subscribe({
      next: (res) => {
        this.admins = res.data;
        this.totalAdmins = res.data.length;
        this.activeAdmins = res.data.filter(a => a.isActive).length;
        this.inactiveAdmins = res.data.filter(a => !a.isActive).length;
      },
      error: (err) => {
        console.log(err);
        this._ToastrService.error('Failed to load admins', 'Talentree', { timeOut: 2000, closeButton: true });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.adminSub) this.adminSub.unsubscribe();
    if (this.actionSub) this.actionSub.unsubscribe();
  }

  // ================================
  // table actions
  // ================================

  handleEvent(event: any): void {
    const action = event.action;
    const row: AdminDto = event.row;
    this.selectedAdmin = row;

    if (action === 'deactivate') {
      this.deactivate(row);
    }
    if (action === 'reactivate') {
      this.reactivate(row);
    }
    if (action === 'unlock') {
      this.unlockAdmin(row);
    }
    if (action === 'revoke') {
      this.revokeSessions(row);
    }
  }

  deactivate(admin: AdminDto): void {
    this.actionSub = this._AdminManagmentService.deactivateAdmin(admin.id).subscribe({
      next: (res) => {
        this._ToastrService.warning(res.message ?? 'Admin deactivated', 'Talentree', { timeOut: 2000, closeButton: true });
        this.loadAdmins();
      },
      error: (err) => {
        this._ToastrService.error(err.error?.message ?? 'Failed to deactivate', 'Talentree', { timeOut: 2000, closeButton: true });
      }
    });
  }

  reactivate(admin: AdminDto): void {
    this.actionSub = this._AdminManagmentService.reactivateAdmin(admin.id).subscribe({
      next: (res) => {
        this._ToastrService.success(res.message ?? 'Admin reactivated', 'Talentree', { timeOut: 2000, closeButton: true });
        this.loadAdmins();
      },
      error: (err) => {
        this._ToastrService.error(err.error?.message ?? 'Failed to reactivate', 'Talentree', { timeOut: 2000, closeButton: true });
      }
    });
  }

  unlockAdmin(admin: AdminDto): void {
    if (!confirm(`Unlock "${admin.fullName}"? This will remove account lockout.`)) return;
    this.actionSub = this._AdminManagmentService.unlockAdmin(admin.id).subscribe({
      next: (res) => {
        this._ToastrService.success(res.message ?? 'Admin unlocked', 'Talentree', { timeOut: 2000, closeButton: true });
        this.loadAdmins();
      },
      error: (err) => {
        this._ToastrService.error(err.error?.message ?? 'Failed to unlock admin', 'Talentree', { timeOut: 2000, closeButton: true });
      }
    });
  }

  revokeSessions(admin: AdminDto): void {
    if (!confirm(`Revoke all sessions for "${admin.fullName}"? They will be signed out immediately.`)) return;
    this.actionSub = this._AdminManagmentService.revokeAdminSessions(admin.id).subscribe({
      next: (res) => {
        this._ToastrService.warning(res.message ?? 'Sessions revoked', 'Talentree', { timeOut: 2000, closeButton: true });
        this.loadAdmins();
      },
      error: (err) => {
        this._ToastrService.error(err.error?.message ?? 'Failed to revoke sessions', 'Talentree', { timeOut: 2000, closeButton: true });
      }
    });
  }

  // ================================
  // modal actions
  // ================================

  openCreateModal(): void {
    this.isCreateOpen = true;
  }

  closeModal(): void {
    this.isCreateOpen = false;
  }

  onAdminCreated(): void {
    this.closeModal();
    this.loadAdmins();
    this._ToastrService.success('Admin created successfully', 'Talentree', { timeOut: 2000, closeButton: true });
  }
}