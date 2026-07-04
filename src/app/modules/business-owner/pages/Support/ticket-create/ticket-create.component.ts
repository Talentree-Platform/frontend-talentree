



import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupportService } from '../../../core/services/support.service';
import { ToastService }   from '../../../core/services/toast.service';

@Component({
  selector: 'app-ticket-create',
  standalone: true,
  imports: [FormsModule , ReactiveFormsModule],
  templateUrl: './ticket-create.component.html',
  styleUrl: './ticket-create.component.scss'
})
export class TicketCreateComponent {
  private fb      = inject(FormBuilder);
  private svc     = inject(SupportService);
  private toast   = inject(ToastService);
  private router  = inject(Router);

  submitting = false;
  files: File[] = [];

  readonly categories = [
    { value: 1, label: 'Technical Issue' },
    { value: 2, label: 'Account' },
    { value: 3, label: 'Payment' },
    { value: 4, label: 'Product' },
    { value: 5, label: 'Order' },
    { value: 6, label: 'Other' },
    { value: 7, label: 'Supplier' }
  ];
  form = this.fb.group({
    subject:     ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required, Validators.minLength(20)]],
    category:    [null as number | null, Validators.required],
  });

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.files = [...this.files, ...Array.from(input.files)];
      input.value = '';
    }
  }

  removeFile(index: number): void {
    this.files = this.files.filter((_, i) => i !== index);
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;

    const fd = new FormData();
    fd.append('subject',     this.form.value.subject ?? '');
    fd.append('description', this.form.value.description ?? '');
    fd.append('category',    String(this.form.value.category ?? ''));
    this.files.forEach(f => fd.append('attachments', f, f.name));

    this.svc.createTicket(fd).subscribe({
      next: () => {
        this.toast.show('Ticket created successfully!', 'success');
        this.router.navigate(['/businessowner/tickets']);
      },
      error: () => {
        this.toast.show('Failed to create ticket. Please try again.', 'error');
        this.submitting = false;
      },
    });
  }

  cancel(): void { this.router.navigate(['/support/tickets']); }

  // Helper
  fieldError(name: string): boolean {
    const c = this.form.get(name);
    return !!(c?.invalid && c.touched);
  }
}