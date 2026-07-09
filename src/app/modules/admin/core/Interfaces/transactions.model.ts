// ─── Enums ───────────────────────────────────────────────────────────────────

export enum TransactionType {
    Payment = 0,
    Refund = 1,
    Withdrawal = 2,
    Deposit = 3,
    Transfer = 4,
    Commission = 5,
}

// ─── Core Transaction Interface (matches real API) ────────────────────────────

export interface Transaction {
    id: number;
    businessOwnerName: string;
    businessOwnerEmail: string | null;
    anomalyFlag: boolean;
    anomalyScore: number;
    createdAt: string;
    type: TransactionType;
    description: string;
    amount: number;
    balanceAfter: number;
    referenceId: number;
    referenceType: string;
}

// ─── Paginated Response (matches real API) ────────────────────────────────────

export interface PaginatedResponse<T> {
    data: T[];
    count: number;
    pageIndex: number;
    pageSize: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
    firstItemIndex: number;
    lastItemIndex: number;
}

// ─── KPIs computed from list ──────────────────────────────────────────────────

export interface TransactionKpis {
    total: number;
    payments: number;
    refunds: number;
    withdrawals: number;
    deposits: number;
    transfers: number;
    commissions: number;
    totalInflow: number;
    totalOutflow: number;
    anomalyCount: number;
}

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface TransactionQueryParams {
    BoId?: number;
    Type?: number;
    DateFrom?: string;
    DateTo?: string;
    AnomalyFlaggedOnly?: boolean;
    Search?: string;
    PageIndex?: number;
    PageSize?: number;
}

export interface ReportQueryParams {
    from?: string;
    to?: string;
}

// ─── Label Helpers ────────────────────────────────────────────────────────────

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
    [TransactionType.Payment]: 'Payment',
    [TransactionType.Refund]: 'Refund',
    [TransactionType.Withdrawal]: 'Withdrawal',
    [TransactionType.Deposit]: 'Deposit',
    [TransactionType.Transfer]: 'Transfer',
    [TransactionType.Commission]: 'Commission',
};