// ─────────────────────────────────────────────────────────────────────────────
// Talentree · co-invoice-button
// ─────────────────────────────────────────────────────────────────────────────
import { Component, Input, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerOrdersService } from '../../../Core/services/customer-orders.service';

@Component({
  selector: 'app-co-invoice-button',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './co-invoice-button.component.html',
  styleUrls: ['./co-invoice-button.component.scss'],
})
export class CoInvoiceButtonComponent {
  @Input({ required: true }) orderId!: string;
  @Input({ required: true }) orderNumber!: string;

  protected readonly svc = inject(CustomerOrdersService);
  readonly failed = signal(false);

  download(): void {
    this.failed.set(false);
    this.svc.downloadInvoice(this.orderId, this.orderNumber).subscribe({
      error: () => this.failed.set(true),
    });
  }
}
