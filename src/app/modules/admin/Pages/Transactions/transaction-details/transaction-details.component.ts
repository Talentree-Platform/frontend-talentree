import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Transaction,
  TRANSACTION_TYPE_LABELS,
  TransactionType,
} from '../../../core/services/transactions.model';

@Component({
  selector: 'app-transaction-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionDetailsComponent {
  @Input() transaction!: Transaction;
  @Output() closed = new EventEmitter<void>();

  typeLabels = TRANSACTION_TYPE_LABELS;
  TransactionType = TransactionType;

  close(): void {
    this.closed.emit();
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  }
}