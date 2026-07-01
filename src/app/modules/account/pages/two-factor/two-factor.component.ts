import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../../account.service';

type Step = 'idle' | 'otp';

@Component({
  selector: 'app-two-factor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './two-factor.component.html',
  styleUrls: ['./two-factor.component.css'],
})
export class TwoFactorComponent implements OnDestroy {
  @Input() isTwoFactorEnabled!: boolean;
  @Output() statusChanged = new EventEmitter<void>();

  private destroy$ = new Subject<void>();

  step: Step = 'idle';
  otpCode = '';
  loading = false;

  constructor(
    private accountService: AccountService,
    private toastr: ToastrService
  ) { }

  requestEnable(): void {
    this.loading = true;
    this.accountService
      .requestEnable2FA()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.loading = false;
          if (res.success) {
            this.step = 'otp';
            this.toastr.info('OTP sent to your email. Please check your inbox.');
          } else {
            this.toastr.error(res.message || 'Failed to send OTP.');
          }
        },
        error: () => {
          this.loading = false;
          this.toastr.error('Something went wrong. Please try again.');
        },
      });
  }

  confirmEnable(): void {
    if (!this.otpCode.trim()) {
      this.toastr.warning('Please enter the OTP code.');
      return;
    }
    this.loading = true;
    this.accountService
      .confirmEnable2FA({ otpCode: this.otpCode })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.loading = false;
          if (res.success) {
            this.toastr.success('Two-factor authentication enabled successfully!');
            this.step = 'idle';
            this.otpCode = '';
            this.statusChanged.emit();
          } else {
            this.toastr.error(res.message || 'Invalid OTP code.');
          }
        },
        error: () => {
          this.loading = false;
          this.toastr.error('Something went wrong. Please try again.');
        },
      });
  }

  disable2FA(): void {
    if (!confirm('Are you sure you want to disable two-factor authentication?')) return;
    this.loading = true;
    this.accountService
      .disable2FA()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.loading = false;
          if (res.success) {
            this.toastr.success('Two-factor authentication disabled.');
            this.statusChanged.emit();
          } else {
            this.toastr.error(res.message || 'Failed to disable 2FA.');
          }
        },
        error: () => {
          this.loading = false;
          this.toastr.error('Something went wrong. Please try again.');
        },
      });
  }

  cancelOtp(): void {
    this.step = 'idle';
    this.otpCode = '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}