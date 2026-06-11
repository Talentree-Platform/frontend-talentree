import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { OwnerSettingService } from '../../../core/services/owner-setting.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-setting-payment-billing',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './setting-payment-billing.component.html',
  styleUrl: './setting-payment-billing.component.css'
})
export class SettingPaymentBillingComponent {

  // 🔐 password (for API)
  password: string = '';

  // 👁️ masked account (from API)
  maskedAccountNumber: string = '';

  // ⏳ loading states
  isLoading = false;
  isSubmitting = false;
  private readonly _ToastrService=inject(ToastrService)
  constructor(
    private fb: FormBuilder,
    private service: OwnerSettingService
  ) {}

  // ✅ form
  paymentForm = this.fb.group({
    bankName: ['', Validators.required],
    accountHolderName: ['', Validators.required],
    accountNumber: ['', Validators.required],
    routingSwiftCode: ['', Validators.required]
  });

  // ================= LOAD DATA =================
  loadPaymentInfo() {
    if (!this.password) {
      alert('Please enter your password first');
      return;
    }

    this.isLoading = true;

    this.service.getPaymentInfo(this.password).subscribe({
      next: (res) => {
        const data = res.data;
        console.log(res);
        
        this._ToastrService.success(res.message , 'Talentree')
        // ✅ patch values to form
        this.paymentForm.patchValue({
          bankName: data.bankName || '',
          accountHolderName: data.accountHolderName || '',
          routingSwiftCode: data.routingSwiftCode || ''
        });

        // 👁️ masked account
        this.maskedAccountNumber = data.maskedAccountNumber || '';

        this.isLoading = false;
      },

      error: (err) => {
        this.isLoading = false;
        console.error(err);
        alert('Wrong password or failed to load data');
      }
    });
  }

  // ================= SUBMIT =================
  submit() {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    if (!this.password) {
      alert('Password is required');
      return;
    }

    this.isSubmitting = true;

    const formValue = this.paymentForm.getRawValue();

const payload = {
  currentPassword: this.password,
  bankName: formValue.bankName || '',
  accountHolderName: formValue.accountHolderName || '',
  accountNumber: formValue.accountNumber || '',
  routingSwiftCode: formValue.routingSwiftCode || ''
};

    this.service.updatePaymentInfo(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;

        alert('Payment info updated successfully');

        // 🔄 reload updated data
        this.loadPaymentInfo();
      },

      error: (err) => {
        this.isSubmitting = false;
        console.error(err);
        alert('Failed to update payment info');
      }
    });
  }
}