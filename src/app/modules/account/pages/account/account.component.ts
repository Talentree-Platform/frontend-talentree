import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AccountService } from '../../account.service';
import { SecurityStatus, AccountPermissions } from '../../account.models';
import { SecurityStatusComponent } from '../security-status/security-status.component';
import { TwoFactorComponent } from '../two-factor/two-factor.component';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, SecurityStatusComponent, TwoFactorComponent],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
})
export class AccountComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  securityStatus: SecurityStatus | null = null;
  permissions: AccountPermissions | null = null;
  loading = true;
  error: string | null = null;

  constructor(private accountService: AccountService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;

    this.accountService
      .getSecurityStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) this.securityStatus = res.data;
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load security status.';
          this.loading = false;
        },
      });

    this.accountService
      .getPermissions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) this.permissions = res.data;
        },
        error: () => { },
      });
  }

  on2FAStatusChanged(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}