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
  revokeForm!: FormGroup;

  loginHistory: any[] = [];
  private readonly _ToastrService=inject(ToastrService);
  constructor(
    private fb: FormBuilder,
    private settingService: OwnerSettingService,
    private authService :AuthService
  ) {}

  ngOnInit(): void {

    // ================= FORMS =================

    this.passwordForm = this.fb.group({
  currentPassword: ['', Validators.required],

  newPassword: ['', [
    Validators.required,
    Validators.minLength(8)
  ]],

  confirmNewPassword: ['', Validators.required],
}, {
  validators: this.passwordMatchValidator
});

    this.revokeForm = this.fb.group({
      currentRefreshToken: ['', Validators.required]
    });

    // ================= LOAD HISTORY =================
    this.loadLoginHistory();
  }

  // ================= CHANGE PASSWORD =================

  changePassword(): void {
    if (this.passwordForm.invalid) return;

    this.settingService.changePassword(this.passwordForm.value)
      .subscribe({
        next: (res) => {
          console.log('Password updated', res);
          this._ToastrService.success(res.message , 'Talentree');
          this.passwordForm.reset();
        },
        error: (err) => {
          this._ToastrService.error(err.error.message , 'Talentree');
          console.error('Error changing password', err);
        }
      });
  }
  passwordMatchValidator(form: any) {
  const newPassword = form.get('newPassword')?.value;
  const confirmPassword = form.get('confirmNewPassword')?.value;

  return newPassword === confirmPassword ? null : { mismatch: true };
}
  // ================= REVOKE SESSIONS =================

  revokeSessions(): void {

  const refreshToken = this.authService.getRefreshToken();

  if (!refreshToken) {
    console.error('No refresh token found');
    return;
  }

  this.settingService.revokeOtherSessions({
    currentRefreshToken: refreshToken
  }).subscribe({
    next: (res) => {
      this._ToastrService.success(res.message , 'Talentree' )
      console.log('Sessions revoked successfully', res);
    },
    error: (err) => {
      this._ToastrService.error('Error revoking sessions' , 'Talentree' )
      console.error('Error revoking sessions', err);
    }
  });
}

  // ================= LOGIN HISTORY =================

  loadLoginHistory(): void {
    this.settingService.getLoginHistory()
      .subscribe({
        next: (res: any) => {
          this.loginHistory = res?.data || [];
        },
        error: (err) => {
          console.error('Error loading login history', err);
        }
      });
  }

  showCurrentPassword = false;
showNewPassword = false;
showConfirmPassword = false;

toggleCurrentPassword(): void {
  this.showCurrentPassword = !this.showCurrentPassword;
}

toggleNewPassword(): void {
  this.showNewPassword = !this.showNewPassword;
}

toggleConfirmPassword(): void {
  this.showConfirmPassword = !this.showConfirmPassword;
}
}