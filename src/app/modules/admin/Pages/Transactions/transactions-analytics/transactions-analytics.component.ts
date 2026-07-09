import {
  Component,
  Input,
  OnChanges,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Transaction,
  TransactionKpis,
  TransactionType,
} from '../../../core/Interfaces/transactions.model';

@Component({
  selector: 'app-transactions-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transactions-analytics.component.html',
  styleUrls: ['./transactions-analytics.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionsAnalyticsComponent implements OnChanges {
  @Input() transactions: Transaction[] = [];
  @Input() totalCount: number = 0;
  @Input() loading: boolean = false;

  kpis: TransactionKpis = this.emptyKpis();

  ngOnChanges(): void {
    this.kpis = this.compute(this.transactions);
  }

  private compute(list: Transaction[]): TransactionKpis {
    const kpis = this.emptyKpis();
    kpis.total = this.totalCount || list.length;

    for (const tx of list) {
      if (tx.type === TransactionType.Payment) kpis.payments++;
      if (tx.type === TransactionType.Refund) kpis.refunds++;
      if (tx.type === TransactionType.Withdrawal) kpis.withdrawals++;
      if (tx.type === TransactionType.Deposit) kpis.deposits++;
      if (tx.type === TransactionType.Transfer) kpis.transfers++;
      if (tx.type === TransactionType.Commission) kpis.commissions++;
      if (tx.anomalyFlag) kpis.anomalyCount++;

      if (tx.amount >= 0) {
        kpis.totalInflow += tx.amount;
      } else {
        kpis.totalOutflow += Math.abs(tx.amount);
      }
    }
    return kpis;
  }

  private emptyKpis(): TransactionKpis {
    return {
      total: 0,
      payments: 0,
      refunds: 0,
      withdrawals: 0,
      deposits: 0,
      transfers: 0,
      commissions: 0,
      totalInflow: 0,
      totalOutflow: 0,
      anomalyCount: 0,
    };
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD', minimumFractionDigits: 2,
    }).format(value);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }
}