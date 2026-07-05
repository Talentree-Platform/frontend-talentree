import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { AdminProductService } from '../../core/services/admin-products.service';

@Component({
  selector: 'app-bulk-approve-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './bulk-approve-modal.component.html',
  styleUrl: './bulk-approve-modal.component.css'
})
export class BulkApproveModalComponent {
  @Input() productIds: number[] = [];

  @Output() closed = new EventEmitter<void>();
  /** Emits the ids that were approved, so the parent can remove them from its list. */
  @Output() approved = new EventEmitter<number[]>();

  readonly form = this.fb.nonNullable.group({
    notes: ['', [Validators.maxLength(2000)]]
  });

  submitting = false;

  get count(): number {
    return this.productIds.length;
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly adminProductService: AdminProductService,
    private readonly toastr: ToastrService
  ) { }

  onBackdropClick(): void {
    this.dismiss();
  }

  dismiss(): void {
    if (this.submitting) return;
    this.resetForm();
    this.closed.emit();
  }

  confirm(): void {
    if (this.count === 0 || this.submitting) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const notes = this.form.controls.notes.value.trim();
    this.submitting = true;

    this.adminProductService
      .bulkApprove({ productIds: this.productIds, notes })
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: (res) => {
          if (res?.success) {
            this.toastr.success(`${this.count} product(s) approved.`, 'Approved');
            const ids = [...this.productIds];
            this.resetForm();
            this.approved.emit(ids);
            this.closed.emit();
          } else {
            this.toastr.error(res?.message?.trim() || 'Could not approve the selected products.', 'Error');
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
    }
    return 'Could not approve the selected products. Please try again.';
  }
}
