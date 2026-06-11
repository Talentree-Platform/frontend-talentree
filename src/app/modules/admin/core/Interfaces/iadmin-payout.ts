export interface IAdminPayout {
}
export enum PayoutStatus {
  Pending   = 0,
  Approved  = 1,
  Completed = 3,
  Rejected  = 4,
}

export interface Payout {
  id: number;
  createdAt: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  bankName: string;
  accountHolderName: string;
  maskedAccountIdentifier: string;
  routingSwiftCode: string;
  rejectionReason?: string;
}

export interface PayoutListResponse {
  data: {
    data: Payout[];
    count: number;
    pageIndex: number;
    pageSize: number;
  };
}

export interface PayoutSummary {
  pending: number;
  approved: number;
  completed: number;
  rejected: number;
}