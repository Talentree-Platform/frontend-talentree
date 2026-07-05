import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { AdminProductService } from '../../core/services/admin-products.service';

@Component({
  selector: 'app-request-changes-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './request-changes-modal.component.html',
  styleUrl: './request-changes-modal.component.css'
})
export class RequestChangesModalComponent {
  @Input() productName = '';
  @Input() productId: number | null = null;

  @Output() closed = new EventEmitter<void>();
  @Output() changed = new EventEmitter<string>(); // emits the "changes" text on success

  readonly form = this.fb.nonNullable.group({
    changes: ['', [Validators.required, Validators.minLength(5)]]
  });

  submitting = false;

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
    this.closed.emit();
  }

  confirm(): void {
    if (this.productId == null || this.submitting) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const changes = this.form.controls.changes.value.trim();
    if (!changes) return;

    this.submitting = true;

    this.adminProductService
      .requestChanges({ productId: this.productId, changes })
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: (res) => {
          if (res?.success) {
            this.toastr.success('Change request sent to the seller.', 'Sent');
            this.changed.emit(changes);
            this.closed.emit();
          } else {
            this.toastr.error(res?.message?.trim() || 'Could not send the request.', 'Error');
          }
        },
        error: (err: unknown) => {
          this.toastr.error(this.messageFromHttp(err), 'Error');
        }
      });
  }

  private messageFromHttp(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error;
      if (typeof body === 'object' && body && 'message' in body) {
        return String((body as { message: string }).message);
      }
      if (typeof body === 'string' && body.trim()) return body;
      if (err.status === 403) return 'You are not allowed to request changes.';
      if (err.status === 404) return 'Product was not found.';
    }
    return 'Could not send the request. Please try again.';
  }
}
