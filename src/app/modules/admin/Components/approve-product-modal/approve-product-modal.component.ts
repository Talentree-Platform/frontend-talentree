import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-approve-product-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './approve-product-modal.component.html',
  styleUrl: './approve-product-modal.component.css'
})
export class ApproveProductModalComponent {
  @Input() productName = '';
  @Input() productId: number | null = null;

  @Output() closed = new EventEmitter<void>();
  @Output() approved = new EventEmitter<void>();

  readonly form = this.fb.nonNullable.group({
    notes: ['', [Validators.maxLength(2000)]]
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

  confirm(): void {
    if (this.productId == null || this.submitting) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const notes = this.form.controls.notes.value.trim();
    this.submitting = true;

    this.adminService
      .approveProduct(this.productId, notes)
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: (res) => {
          if (res?.success) {
            this.toastr.success('Product approved successfully.', 'Approved');
            this.resetForm();
            this.approved.emit();
            this.closed.emit();
          } else {
            this.toastr.error(res?.message?.trim() || 'Could not approve this product.', 'Error');
          }
        },
        error: (err: unknown) => {
          this.toastr.error(this.messageFromHttp(err), 'Error');
        }
      });
  }

  private resetForm(): void {
    this.form.reset({ notes: '' });
  }

  private messageFromHttp(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error;
      if (typeof body === 'object' && body && 'message' in body) {
        return String((body as { message: string }).message);
      }
      if (typeof body === 'string' && body.trim()) return body;
      if (err.status === 403) return 'You are not allowed to approve products.';
      if (err.status === 404) return 'Product was not found.';
    }
    return 'Could not approve this product. Please try again.';
  }
}
