// ─────────────────────────────────────────────────────────
// Payment Interfaces
// ─────────────────────────────────────────────────────────

export interface PaymentIntentData {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

export interface PaymentIntentResponse {
  success: boolean;
  data?: PaymentIntentData;
  errors?: string[];
}

export type PaymentErrorType =
  | 'already_paid'
  | 'not_quoted'
  | 'generic';

export interface PaymentError {
  type: PaymentErrorType;
  message: string;
}