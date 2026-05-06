export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  availableBalance: number;
  pendingPayouts: number;
  periodFrom: string;
  periodTo: string;
}

export interface FinancialTransaction {
  id: number;
  createdAt: string;
  type: TransactionType;
  description: string;
  amount: number;
  balanceAfter: number;
  referenceId: number | null;
  referenceType: string;
}

export enum TransactionType {
  Sale = 0,
  Expense = 1,
  Fee = 2,
  Refund = 3,
  Withdrawal = 4,
  Deposit = 5,
}

export interface FinancialTransactionFilters {
  type?: TransactionType;
  pageIndex?: number;
  pageSize?: number;
}

export interface FinancialPaginatedTransactions {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: FinancialTransaction[];
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  firstItemIndex: number;
  lastItemIndex: number;
}

export interface FinancialApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
  errors: string[] | null;
  timestamp: string;
}