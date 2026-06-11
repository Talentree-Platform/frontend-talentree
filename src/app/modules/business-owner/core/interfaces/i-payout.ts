export interface PayoutRequest {
  amount: number;
  bankName: string;
  accountHolderName: string;
  accountIdentifier: string;
  routingSwiftCode: string;
}

export interface Payout {
  id: number;
  amount: number;
  currency: string;
  status: PayoutStatus;
  bankName: string;
  maskedAccountIdentifier: string;
  createdAt: string;
  processedAt?: string;
}

export enum PayoutStatus {
  Pending = 0,
  Approved = 1,
  Completed = 2,
  Rejected = 3,
}
export interface PayoutHistoryData {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: Payout[];
  totalPages: number;
}

export interface PayoutHistoryResponse {
  success: boolean;
  data: PayoutHistoryData;
  message: string | null;
  errors: any;
  timestamp: string;
}

export interface WalletSummary {
  availableBalance: number;
  pendingBalance: number;
  totalEarnings: number;
  currency: string;
}