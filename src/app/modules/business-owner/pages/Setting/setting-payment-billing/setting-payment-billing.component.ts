import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  FormsModule,
  Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OwnerSettingService } from '../../../core/services/owner-setting.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-setting-payment-billing',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './setting-payment-billing.component.html',
  styleUrl: './setting-payment-billing.component.css'
})
export class SettingPaymentBillingComponent {

  // ─── Password (ngModel) ───────────────────────────────────────
  password: string = '';

  // ─── Masked account returned from API ─────────────────────────
  maskedAccountNumber: string = '';

  // ─── Loading states ───────────────────────────────────────────
  isLoading    = false;   // load-info spinner
  isSubmitting = false;   // save spinner

  // ─── Floating-label focus trackers ────────────────────────────
  pwFocus       = false;
  bankNameFocus = false;
  holderFocus   = false;
  accNumFocus   = false;
  swiftFocus    = false;

  // ─── Services ─────────────────────────────────────────────────
  private readonly _toastr  = inject(ToastrService);
  private readonly fb       = inject(FormBuilder);
  private readonly service  = inject(OwnerSettingService);

  // ─── Reactive form ────────────────────────────────────────────
  paymentForm = this.fb.group({
    bankName:           ['', Validators.required],
    accountHolderName:  ['', Validators.required],
    accountNumber:      ['', Validators.required],
    routingSwiftCode:   ['', Validators.required]
  });

  // ═══════════════════════════════════════════════════════════════
  //  LOAD BANK INFO
  // ═══════════════════════════════════════════════════════════════
  loadPaymentInfo(): void {
    if (!this.password.trim()) {
      this._toastr.warning('Please enter your password first.', 'Talentree');
      return;
    }

    this.isLoading = true;

    this.service.getPaymentInfo(this.password).subscribe({
      next: (res) => {
        const data = res.data;

        // Patch form fields
        this.paymentForm.patchValue({
          bankName:          data.bankName          || '',
          accountHolderName: data.accountHolderName || '',
          routingSwiftCode:  data.routingSwiftCode  || ''
        });

        // Read-only masked number
        this.maskedAccountNumber = data.maskedAccountNumber || '';

        this._toastr.success(res.message, 'Talentree');
        this.isLoading = false;
      },

      error: (err) => {
        this.isLoading = false;
        console.error(err);
        this._toastr.error(
          'Wrong password or failed to load data.',
          'Talentree'
        );
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════
  //  SUBMIT / UPDATE
  // ═══════════════════════════════════════════════════════════════
  submit(): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    if (!this.password.trim()) {
      this._toastr.warning('Password is required to save changes.', 'Talentree');
      return;
    }

    this.isSubmitting = true;

    const formValue = this.paymentForm.getRawValue();

    const payload = {
      currentPassword:   this.password,
      bankName:          formValue.bankName          || '',
      accountHolderName: formValue.accountHolderName || '',
      accountNumber:     formValue.accountNumber     || '',
      routingSwiftCode:  formValue.routingSwiftCode  || ''
    };

    this.service.updatePaymentInfo(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this._toastr.success(
          'Payment information updated successfully.',
          'Talentree'
        );
        // Refresh masked account number
        this.loadPaymentInfo();
      },

      error: (err) => {
        this.isSubmitting = false;
        console.error(err);
        this._toastr.error(
          'Failed to update payment info. Please try again.',
          'Talentree'
        );
      }
    });
  }
}