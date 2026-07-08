// src/app/modules/admin/Pages/Admin/admin-managment/admin-list/admin-list.component.ts

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  AdminManagementService,
  AdminDto,
  CreateAdminDto,
  EditAdminDto,
  ChangeAdminRoleDto,
  ResetAdminPasswordDto
} from '../../../../core/services/adminManagment.service';

type ModalType =
  | 'create'
  | 'edit'
  | 'role'
  | 'reset-password'
  | 'view-details'
  | null;

type ConfirmAction = 'deactivate' | 'activate' | 'unlock' | 'revoke' | null;

@Component({
  selector: 'app-admin-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-list.component.html',
  styleUrls: ['./admin-list.component.scss']
})
export class AdminListComponent implements OnInit {
  admins = signal<AdminDto[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  actionMessage = signal<string | null>(null);

  activeModal = signal<ModalType>(null);
  selectedAdmin = signal<AdminDto | null>(null);
  isSubmitting = signal(false);

  /** Quick-action confirmation state */
  confirmingAdmin = signal<AdminDto | null>(null);
  confirmingAction = signal<ConfirmAction>(null);
  isConfirmLoading = signal(false);

  readonly assignableRoles = ['SuperAdmin', 'Admin', 'SupportStaff', 'ContentManager'];

  createForm: FormGroup;
  editForm: FormGroup;
  roleForm: FormGroup;
  resetPasswordForm: FormGroup;

  constructor(
    private adminManagementService: AdminManagementService,
    private fb: FormBuilder
  ) {
    this.createForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      role: ['Admin', Validators.required]
    });

    this.editForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['']
    });

    this.roleForm = this.fb.group({
      role: ['', Validators.required]
    });

    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmNewPassword: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadAdmins();
  }

  loadAdmins(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.adminManagementService.getAllAdmins().subscribe({
      next: (response) => {
        this.admins.set(response.data ?? []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to load the admin list');
        this.isLoading.set(false);
      }
    });
  }

  // ── Modal control ─────────────────────────────────────────────────────────

  openCreateModal(): void {
    this.createForm.reset({ role: 'Admin' });
    this.errorMessage.set(null);
    this.activeModal.set('create');
  }

  openEditModal(admin: AdminDto): void {
    this.selectedAdmin.set(admin);
    this.editForm.reset({
      fullName: admin.fullName,
      email: admin.email,
      phoneNumber: admin.phoneNumber ?? ''
    });
    this.errorMessage.set(null);
    this.activeModal.set('edit');
  }

  openRoleModal(admin: AdminDto): void {
    this.selectedAdmin.set(admin);
    this.roleForm.reset({ role: admin.role });
    this.errorMessage.set(null);
    this.activeModal.set('role');
  }

  openResetPasswordModal(admin: AdminDto): void {
    this.selectedAdmin.set(admin);
    this.resetPasswordForm.reset();
    this.errorMessage.set(null);
    this.activeModal.set('reset-password');
  }

  openViewDetailsModal(admin: AdminDto): void {
    this.selectedAdmin.set(admin);
    this.activeModal.set('view-details');
  }

  closeModal(): void {
    this.activeModal.set(null);
    this.selectedAdmin.set(null);
    this.isSubmitting.set(false);
  }

  private flashMessage(msg: string): void {
    this.actionMessage.set(msg);
    setTimeout(() => this.actionMessage.set(null), 3500);
  }

  // ── Create ────────────────────────────────────────────────────────────────

  submitCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    const dto: CreateAdminDto = this.createForm.value;

    this.adminManagementService.createAdmin(dto).subscribe({
      next: () => {
        this.flashMessage('Admin created successfully');
        this.closeModal();
        this.loadAdmins();
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to create the admin');
        this.isSubmitting.set(false);
      }
    });
  }

  // ── Edit ──────────────────────────────────────────────────────────────────

  submitEdit(): void {
    const admin = this.selectedAdmin();
    if (!admin || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    const dto: EditAdminDto = this.editForm.value;

    this.adminManagementService.updateAdmin(admin.id, dto).subscribe({
      next: () => {
        this.flashMessage('Admin details updated');
        this.closeModal();
        this.loadAdmins();
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to update the details');
        this.isSubmitting.set(false);
      }
    });
  }

  // ── Role change ───────────────────────────────────────────────────────────

  submitRoleChange(): void {
    const admin = this.selectedAdmin();
    if (!admin || this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    const dto: ChangeAdminRoleDto = this.roleForm.value;

    this.adminManagementService.updateAdminRole(admin.id, dto).subscribe({
      next: () => {
        this.flashMessage('Role updated successfully');
        this.closeModal();
        this.loadAdmins();
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to update the role');
        this.isSubmitting.set(false);
      }
    });
  }

  // ── Reset password ────────────────────────────────────────────────────────

  submitResetPassword(): void {
    const admin = this.selectedAdmin();
    if (!admin || this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }
    const { newPassword, confirmNewPassword } = this.resetPasswordForm.value;
    if (newPassword !== confirmNewPassword) {
      this.errorMessage.set('Passwords do not match');
      return;
    }

    this.isSubmitting.set(true);
    const dto: ResetAdminPasswordDto = { newPassword, confirmNewPassword };

    this.adminManagementService.resetAdminPassword(admin.id, dto).subscribe({
      next: () => {
        this.flashMessage('Password reset successfully');
        this.closeModal();
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to reset the password');
        this.isSubmitting.set(false);
      }
    });
  }



  // ── Quick actions with confirmation ───────────────────────────────────────

  requestConfirm(admin: AdminDto, action: ConfirmAction): void {
    this.confirmingAdmin.set(admin);
    this.confirmingAction.set(action);
  }

  cancelConfirm(): void {
    this.confirmingAdmin.set(null);
    this.confirmingAction.set(null);
    this.isConfirmLoading.set(false);
  }

  executeConfirmedAction(): void {
    const admin = this.confirmingAdmin();
    const action = this.confirmingAction();
    if (!admin || !action) return;

    this.isConfirmLoading.set(true);

    let action$: ReturnType<typeof this.adminManagementService.deactivateAdmin>;
    let successMsg: string;

    switch (action) {
      case 'deactivate':
        action$ = this.adminManagementService.deactivateAdmin(admin.id);
        successMsg = `${admin.fullName}'s account has been deactivated`;
        break;
      case 'activate':
        action$ = this.adminManagementService.reactivateAdmin(admin.id);
        successMsg = `${admin.fullName}'s account has been activated`;
        break;
      case 'unlock':
        action$ = this.adminManagementService.unlockAdmin(admin.id);
        successMsg = `${admin.fullName}'s account has been unlocked`;
        break;
      case 'revoke':
        action$ = this.adminManagementService.revokeAdminSessions(admin.id);
        successMsg = `All active sessions for ${admin.fullName} have been ended`;
        break;
    }

    action$.subscribe({
      next: () => {
        this.flashMessage(successMsg);
        this.cancelConfirm();
        this.loadAdmins();
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to perform the action');
        this.isConfirmLoading.set(false);
        this.cancelConfirm();
      }
    });
  }
}