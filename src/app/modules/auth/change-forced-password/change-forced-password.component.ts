import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../core/environment/envirinment';
import { ApiResponse } from '../../admin/core/Interfaces/ibusiness-owner';
import { AuthService } from '../services/auth.service';
export interface ChangeForcedPasswordDto {
  newPassword: string;
  confirmNewPassword: string;
}

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const pass = control.get('newPassword')?.value;
  const confirm = control.get('confirmNewPassword')?.value;
  return pass && confirm && pass !== confirm ? { passwordsMismatch: true } : null;
}

@Component({
  selector: 'app-change-forced-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-forced-password.component.html',
  styleUrls: ['./change-forced-password.component.scss']
})
export class ChangeForcedPasswordComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  private readonly baseUrl = `${environment.baseUrl}/api/auth`;

  isSubmitting = false;

  form: FormGroup = this.fb.group(
    {
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmNewPassword: ['', [Validators.required]]
    },
    { validators: passwordsMatchValidator }
  );

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService
  ) { }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const dto: ChangeForcedPasswordDto = {
      newPassword: this.form.value.newPassword,
      confirmNewPassword: this.form.value.confirmNewPassword
    };

    this.http
      .post<ApiResponse<string>>(`${this.baseUrl}/change-forced-password`, dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.isSubmitting = false;
          if (res?.success) {
            this.toastr.success('Password updated successfully.', 'Success');
            this.authService.redirectBasedOnRole(this.authService.getCurrentUser()?.role || '');  // ⬅️ بدل السطر القديم
          } else {
            this.toastr.error(res?.message || 'Failed to update password.', 'Error');
          }
        },
        error: (err) => {
          this.isSubmitting = false;
          this.toastr.error(err?.error?.message || 'Failed to update password.', 'Error');
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
