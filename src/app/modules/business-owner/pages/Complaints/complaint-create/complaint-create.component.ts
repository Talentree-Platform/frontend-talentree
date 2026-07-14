import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ComplaintService } from '../../../core/services/complaint.service';
import { ToastService } from '../../../core/services/toast.service';
import { VIOLATION_TYPES } from '../../../core/interfaces/i-complaint';

@Component({
  selector: 'app-complaint-create',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './complaint-create.component.html',
  styleUrl: './complaint-create.component.scss'
})
export class ComplaintCreateComponent {
  private fb = inject(FormBuilder);
  private svc = inject(ComplaintService);
  private toast = inject(ToastService);
  private router = inject(Router);

  submitting = false;

  readonly violationTypes = VIOLATION_TYPES;

  form = this.fb.group({
    reportedUserId: ['', [Validators.required]],
    violationType: [null as number | null, Validators.required],
    description: ['', [Validators.required, Validators.minLength(10)]],
    relatedOrderId: [''],
    relatedProductId: [''],
    relatedBrandId: [''],
    relatedContext: [''],
  });

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;

    const v = this.form.value;
    this.svc.submitComplaint({
      reportedUserId: (v.reportedUserId ?? '').trim(),
      violationType: v.violationType as number,
      description: (v.description ?? '').trim(),
      relatedOrderId: (v.relatedOrderId ?? '').trim(),
      relatedProductId: (v.relatedProductId ?? '').trim(),
      relatedBrandId: (v.relatedBrandId ?? '').trim(),
      relatedContext: (v.relatedContext ?? '').trim(),
    }).subscribe({
      next: (res) => {
        this.toast.show('Complaint submitted successfully.', 'success');
        this.router.navigate(['/businessowner/complaints', res.data.id]);
      },
      error: (err) => {
        this.toast.show(err?.error?.message ?? 'Failed to submit complaint. Please try again.', 'error');
        this.submitting = false;
      },
    });
  }

  cancel(): void { this.router.navigate(['/businessowner/bohome']); }

  fieldError(name: string): boolean {
    const c = this.form.get(name);
    return !!(c?.invalid && c.touched);
  }
}
