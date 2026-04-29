import { Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BoProductionRequestService } from '../../../core/services/bo-production-request.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-production-request',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-production-request.component.html',
  styleUrl: './create-production-request.component.css'
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
 
  isFieldInvalid(controlPath: string): boolean {
    const control = this.form.get(controlPath);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
 
  isItemFieldInvalid(itemIndex: number, fieldName: string): boolean {
    const control = this.items.at(itemIndex).get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
 
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
      err?.error?.message || // لو جاية من API
      err?.message ||
      'An unexpected error occurred.';
      // 🔥 ERROR TOAST بدل banner
    this.toastr.error(message, 'Submission Failed');

    // optional (لو لسه محتاجة تستخدميها في logic تاني)
    this.submitError.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

}
