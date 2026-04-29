import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-reject-product-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './reject-product-modal.component.html',
  styleUrl: './reject-product-modal.component.css'
})
export class RejectProductModalComponent {
  @Input() productName = '';
  @Input() productId: number | null = null;

  @Output() closed = new EventEmitter<void>();
  @Output() rejected = new EventEmitter<void>();

  readonly form = this.fb.nonNullable.group({
    reason: ['', [Validators.required, Validators.maxLength(2000)]]
  });

  submitting = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly adminService: AdminService,
    private readonly toastr: ToastrService
  ) {}

  onBackdropClick(): void {
    this.dismiss();
  }

  dismiss(): void {
    if (this.submitting) return;
    this.resetForm();
    this.closed.emit();
  }

  submitReject(): void {
    if (this.productId == null || this.submitting) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const reason = this.form.controls.reason.value.trim();
    if (!reason) {
      this.form.controls.reason.setErrors({ required: true });
      this.form.controls.reason.markAsTouched();
      return;
    }

    this.submitting = true;

    this.adminService
      .rejectProduct(this.productId, reason)
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: (res) => {
          if (res?.success) {
            this.toastr.success('Product rejected successfully.', 'Rejected');
            this.resetForm();
            this.rejected.emit();
            this.closed.emit();
          } else {
            this.toastr.error(res?.message?.trim() || 'Could not reject this product.', 'Error');
          }
        },
        error: (err: unknown) => {
          this.toastr.error(this.messageFromHttp(err), 'Error');
        }
      });
  }

  private resetForm(): void {
    this.form.reset({ reason: '' });
  }

  private messageFromHttp(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error;
      if (typeof body === 'object' && body && 'message' in body) {
        return String((body as { message: string }).message);
      }
      if (typeof body === 'string' && body.trim()) return body;
      if (err.status === 403) return 'You are not allowed to reject products.';
      if (err.status === 404) return 'Product was not found.';
    }
    return 'Could not reject this product. Please try again.';
  }
}
