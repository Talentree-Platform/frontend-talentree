import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OwnerSettingService } from '../../../core/services/owner-setting.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-setting-security-privacy',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './setting-security-privacy.component.html',
  styleUrl: './setting-security-privacy.component.css'
})
export class SettingSecurityPrivacyComponent implements OnInit {

  passwordForm!: FormGroup;

  loginHistory: any[] = [];

  // ─── Spinner flags ────────────────────────────────────────────
  isChangingPassword = false;
  isRevoking         = false;

  // ─── Floating-label focus trackers ───────────────────────────
  curFocus  = false;
  newFocus  = false;
  confFocus = false;

  // ─── Password visibility toggles ─────────────────────────────
  showCurrentPassword = false;
  showNewPassword     = false;
  showConfirmPassword = false;

  // ─── Services ─────────────────────────────────────────────────
  private readonly _toastr         = inject(ToastrService);
  private readonly _fb             = inject(FormBuilder);
  private readonly _settingService = inject(OwnerSettingService);
  private readonly _authService    = inject(AuthService);

  // ═══════════════════════════════════════════════════════════════
  //  LIFECYCLE
  // ═══════════════════════════════════════════════════════════════
  ngOnInit(): void {
    this.passwordForm = this._fb.group({
      currentPassword:    ['', Validators.required],
      newPassword:        ['', [Validators.required, Validators.minLength(8)]],
      confirmNewPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.loadLoginHistory();
  }

  // ═══════════════════════════════════════════════════════════════
  //  VALIDATORS
  // ═══════════════════════════════════════════════════════════════
  passwordMatchValidator(form: FormGroup) {
    const newPw      = form.get('newPassword')?.value;
    const confirmPw  = form.get('confirmNewPassword')?.value;
    return newPw === confirmPw ? null : { mismatch: true };
  }

  // ═══════════════════════════════════════════════════════════════
  //  CHANGE PASSWORD
  // ═══════════════════════════════════════════════════════════════
  changePassword(): void {
    if (this.passwordForm.invalid || this.passwordForm.errors?.['mismatch']) return;

    this.isChangingPassword = true;

    this._settingService.changePassword(this.passwordForm.value).subscribe({
      next: (res) => {
        this.isChangingPassword = false;
        this._toastr.success(res.message, 'Talentree');
        this.passwordForm.reset();
      },
      error: (err) => {
        this.isChangingPassword = false;
        this._toastr.error(err?.error?.message || 'Failed to update password', 'Talentree');
        console.error(err);
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════
  //  REVOKE SESSIONS
  // ═══════════════════════════════════════════════════════════════
  revokeSessions(): void {
    const refreshToken = this._authService.getRefreshToken();

    if (!refreshToken) {
      this._toastr.warning('No active session token found.', 'Talentree');
      return;
    }

    this.isRevoking = true;

    this._settingService.revokeOtherSessions({ currentRefreshToken: refreshToken }).subscribe({
      next: (res) => {
        this.isRevoking = false;
        this._toastr.success(res.message, 'Talentree');
      },
      error: (err) => {
        this.isRevoking = false;
        this._toastr.error('Error revoking sessions', 'Talentree');
        console.error(err);
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════
  //  LOGIN HISTORY
  // ═══════════════════════════════════════════════════════════════
  loadLoginHistory(): void {
    this._settingService.getLoginHistory().subscribe({
      next: (res: any) => {
        this.loginHistory = res?.data || [];
      },
      error: (err) => {
        console.error('Error loading login history', err);
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════
  //  VISIBILITY TOGGLES
  // ═══════════════════════════════════════════════════════════════
  toggleCurrentPassword(): void { this.showCurrentPassword = !this.showCurrentPassword; }
  toggleNewPassword():     void { this.showNewPassword     = !this.showNewPassword; }
  toggleConfirmPassword(): void { this.showConfirmPassword = !this.showConfirmPassword; }
}