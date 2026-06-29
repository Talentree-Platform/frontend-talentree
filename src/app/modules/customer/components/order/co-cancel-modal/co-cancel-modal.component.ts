// ─────────────────────────────────────────────────────────────────────────────
// Talentree · co-cancel-modal
// ─────────────────────────────────────────────────────────────────────────────
import { Component, Input, Output, EventEmitter, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerOrdersService } from '../../../Core/services/customer-orders.service';

type CancelPhase = 'idle' | 'loading' | 'success';

@Component({
  selector: 'app-co-cancel-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './co-cancel-modal.component.html',
  styleUrls: ['./co-cancel-modal.component.scss'],
})
export class CoCancelModalComponent {
  @Input({ required: true }) orderId!: string;
  @Input({ required: true }) orderNumber!: string;

  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();

  protected readonly svc = inject(CustomerOrdersService);

  readonly phase = signal<CancelPhase>('idle');

  ngOnInit(): void {
    this.svc.resetCancelError();
  }

  confirmCancel(): void {
    this.phase.set('loading');

    this.svc.cancelOrder(this.orderId).subscribe({
      next: () => {
        this.phase.set('success');
        setTimeout(() => this.confirmed.emit(), 1100);
      },
      error: () => {
        this.phase.set('idle');
      },
    });
  }

  close(): void {
    if (this.phase() === 'loading') return;
    this.closed.emit();
  }
}
