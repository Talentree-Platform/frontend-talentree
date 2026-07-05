import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { AdminProductService } from '../../core/services/admin-products.service';

import { CategoryOption } from '../../core/services/platform-category.service';

@Component({
  selector: 'app-change-category-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './change-category-modal.component.html',
  styleUrl: './change-category-modal.component.css'
})
export class ChangeCategoryModalComponent {
  @Input() productName = '';
  @Input() productId: number | null = null;
  @Input() currentCategoryId: number | null = null;
  /**
   * Category list for the dropdown. Wire this up to your real CategoryService
   * from the parent component — pass it in as `[categories]="categories"`.
   */
  @Input() categories: CategoryOption[] = [];

  @Output() closed = new EventEmitter<void>();
  @Output() changed = new EventEmitter<number>();

  readonly form = this.fb.nonNullable.group({
    newCategoryId: [null as number | null, [Validators.required]]
  });

  submitting = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly adminProductService: AdminProductService,
    private readonly toastr: ToastrService
  ) { }

  ngOnInit(): void {
    if (this.currentCategoryId != null) {
      this.form.patchValue({ newCategoryId: this.currentCategoryId });
    }
  }

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

    const newCategoryId = this.form.controls.newCategoryId.value;
    if (newCategoryId == null) return;

    if (newCategoryId === this.currentCategoryId) {
      this.toastr.info('That is already this product\u2019s category.', 'No change');
      return;
    }

    this.submitting = true;

    this.adminProductService
      .changeCategory({ productId: this.productId, newCategoryId })
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: (res) => {
          if (res?.success) {
            this.toastr.success('Category updated.', 'Saved');
            this.changed.emit(newCategoryId);
            this.closed.emit();
          } else {
            this.toastr.error(res?.message?.trim() || 'Could not change the category.', 'Error');
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
      if (err.status === 403) return 'You are not allowed to change categories.';
      if (err.status === 404) return 'Product or category was not found.';
    }
    return 'Could not change the category. Please try again.';
  }
}
