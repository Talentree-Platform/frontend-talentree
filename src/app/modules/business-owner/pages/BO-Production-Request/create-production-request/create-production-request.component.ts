import { Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BoProductionRequestService } from '../../../core/services/bo-production-request.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-production-request',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-production-request.component.html',
  styleUrl: './create-production-request.component.scss'
})
export class CreateProductionRequestComponent {
  private fb = inject(FormBuilder);
  private productionRequestService = inject(BoProductionRequestService);
  private toastr = inject(ToastrService);

  isLoading = signal(false);
  submitSuccess = signal(false);
  submitError = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    notes: [''],
    items: this.fb.array([this.createItem()]),
  });

  // ── FormArray helpers ────────────────────────────────────────────────────

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  getItemGroup(index: number): FormGroup {
    return this.items.at(index) as FormGroup;
  }

  createItem(): FormGroup {
    return this.fb.group({
      productType: ['', Validators.required],
      quantity: [null, [Validators.required, Validators.min(1)]],
      preferredRawMaterialId: [null],
      specifications: [''],
    });
  }

  addItem(): void {
    this.items.push(this.createItem());
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  // ── Computed helpers (used by template) ─────────────────────────────────

  totalQuantity(): number {
    return this.items.controls.reduce((sum, ctrl) => {
      const val = (ctrl as FormGroup).get('quantity')?.value;
      return sum + (Number(val) || 0);
    }, 0);
  }

  formProgress(): number {
    let score = 0;
    if (this.isTitleValid()) score += 50;
    if (this.hasValidItems()) score += 50;
    return score;
  }

  isTitleValid(): boolean {
    const ctrl = this.form.get('title');
    return !!ctrl && ctrl.valid;
  }

  hasValidItems(): boolean {
    return this.items.length > 0 && this.items.controls.every(ctrl => ctrl.valid);
  }

  // ── Field validation helpers ─────────────────────────────────────────────

  isFieldInvalid(controlPath: string): boolean {
    const ctrl = this.form.get(controlPath);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  isFieldValid(controlPath: string): boolean {
    const ctrl = this.form.get(controlPath);
    return !!(ctrl && ctrl.valid && (ctrl.dirty || ctrl.touched));
  }

  isItemFieldInvalid(itemIndex: number, fieldName: string): boolean {
    const ctrl = this.items.at(itemIndex).get(fieldName);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  isItemFieldValid(itemIndex: number, fieldName: string): boolean {
    const ctrl = this.items.at(itemIndex).get(fieldName);
    return !!(ctrl && ctrl.valid && (ctrl.dirty || ctrl.touched));
  }

  // ── Form submission ──────────────────────────────────────────────────────

  markAllAsTouched(): void {
    this.form.markAllAsTouched();
    this.items.controls.forEach((ctrl) => (ctrl as FormGroup).markAllAsTouched());
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.submitError.set(null);
    this.submitSuccess.set(false);

    try {
      await this.productionRequestService.create(this.form.value).toPromise();
      this.submitSuccess.set(true);
      this.toastr.success(
        'Your production request has been submitted and is pending review.',
        'Request Created Successfully'
      );
      this.form.reset();
      this.items.clear();
      this.items.push(this.createItem());
    } catch (err: any) {
      const message =
        err?.error?.message ||
        err?.message ||
        'An unexpected error occurred.';
      this.toastr.error(message, 'Submission Failed');
      this.submitError.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }
}