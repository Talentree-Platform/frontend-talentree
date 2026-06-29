// ─────────────────────────────────────────────────────────────────────────────
// Talentree · co-refund-modal
// ─────────────────────────────────────────────────────────────────────────────
import { Component, Input, Output, EventEmitter, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomerOrdersService } from '../../../Core/services/customer-orders.service';
import { CoOrderItem } from '../../../Core/models/co-order.models';

type RefundPhase = 'idle' | 'submitting' | 'success';

@Component({
  selector: 'app-co-refund-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './co-refund-modal.component.html',
  styleUrls: ['./co-refund-modal.component.scss'],
})
export class CoRefundModalComponent implements OnInit {
  @Input({ required: true }) orderId!: string;
  @Input({ required: true }) item!: CoOrderItem;

  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  protected readonly svc = inject(CustomerOrdersService);

  readonly phase = signal<RefundPhase>('idle');

  readonly form = this.fb.nonNullable.group({
    reason: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
  });

  ngOnInit(): void {
    this.svc.resetRefundError();
  }

  get reasonControl() {
    return this.form.controls.reason;
  }

  get showReasonError(): boolean {
    return this.reasonControl.invalid && (this.reasonControl.dirty || this.reasonControl.touched);
  }

  get charCount(): number {
    return this.reasonControl.value?.length ?? 0;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.phase.set('submitting');

    this.svc.requestRefund(this.orderId, this.item.id, {
      reason: this.form.getRawValue().reason,
    }).subscribe({
      next: () => {
        this.phase.set('success');
        setTimeout(() => this.submitted.emit(), 1100);
      },
      error: () => {
        this.phase.set('idle');
      },
    });
  }

  close(): void {
    if (this.phase() === 'submitting') return;
    this.closed.emit();
  }
}
