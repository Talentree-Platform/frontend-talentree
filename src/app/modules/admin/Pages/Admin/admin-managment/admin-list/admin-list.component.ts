// src/app/modules/admin/admin-management/components/admin-list/admin-list.component.ts
// ⚠️ Adjust the AdminManagementService import path below if your folder structure differs

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  AdminManagementService,
  AdminDto,
  CreateAdminDto,
  UpdateAdminDto,
  UpdateAdminRoleDto,
  ResetPasswordDto
} from '../../../../core/services/adminManagment.service';

type ModalType = 'create' | 'edit' | 'role' | 'reset-password' | null;

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
    this.activeModal.set('create');
  }

  openEditModal(admin: AdminDto): void {
    this.selectedAdmin.set(admin);
    this.editForm.reset({
      fullName: admin.fullName,
      email: admin.email,
      phoneNumber: admin.phoneNumber ?? ''
    });
    this.activeModal.set('edit');
  }

  openRoleModal(admin: AdminDto): void {
    this.selectedAdmin.set(admin);
    this.roleForm.reset({ role: admin.role });
    this.activeModal.set('role');
  }

  openResetPasswordModal(admin: AdminDto): void {
    this.selectedAdmin.set(admin);
    this.resetPasswordForm.reset();
    this.activeModal.set('reset-password');
  }

  closeModal(): void {
    this.activeModal.set(null);
    this.selectedAdmin.set(null);
    this.isSubmitting.set(false);
  }

  private flashMessage(msg: string): void {
    this.actionMessage.set(msg);
    setTimeout(() => this.actionMessage.set(null), 3000);
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
    const dto: UpdateAdminDto = this.editForm.value;

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
    const dto: UpdateAdminRoleDto = this.roleForm.value;

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

  // ── Reset password ───────────────────────────────────────────────────────

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
    const dto: ResetPasswordDto = { newPassword, confirmNewPassword };

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

  // ── Quick actions ─────────────────────────────────────────────────────────

  toggleActive(admin: AdminDto): void {
    const action$ = admin.isActive
      ? this.adminManagementService.deactivateAdmin(admin.id)
      : this.adminManagementService.reactivateAdmin(admin.id);

    action$.subscribe({
      next: () => {
        this.flashMessage(admin.isActive ? 'Account deactivated' : 'Account activated');
        this.loadAdmins();
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to perform the action');
      }
    });
  }

  unlockAdmin(admin: AdminDto): void {
    this.adminManagementService.unlockAdmin(admin.id).subscribe({
      next: () => this.flashMessage('Account unlocked'),
      error: (err) => this.errorMessage.set(err?.error?.message || 'Failed to unlock the account')
    });
  }

  revokeSessions(admin: AdminDto): void {
    this.adminManagementService.revokeAdminSessions(admin.id).subscribe({
      next: () => this.flashMessage('All active sessions have been ended'),
      error: (err) => this.errorMessage.set(err?.error?.message || 'Failed to end the sessions')
    });
  }
}