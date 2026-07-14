// ─────────────────────────────────────────────
//  Complaint Module – TypeScript Interfaces
// ─────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors?: string[] | null;
  timestamp?: string;
}

// violationType text/value pairs confirmed against live API responses for 1–3
// (4 only confirmed as a valid value, its label is unconfirmed — kept consistent
// with the platform's broader violation taxonomy used elsewhere).
export const VIOLATION_TYPES: { value: number; label: string }[] = [
  { value: 1, label: 'Fake Products' },
  { value: 2, label: 'Poor Service' },
  { value: 3, label: 'Policy Violation' },
  { value: 4, label: 'Spam' },
  { value: 5, label: 'Fraud' },
  { value: 6, label: 'Harassment' },
  { value: 7, label: 'Other' },
];

// status: 1=Open 2=UnderReview 3=Resolved 4=Rejected
export const COMPLAINT_STATUS: Record<number, { label: string; className: string }> = {
  1: { label: 'Open', className: 'status-open' },
  2: { label: 'Under Review', className: 'status-review' },
  3: { label: 'Resolved', className: 'status-resolved' },
  4: { label: 'Rejected', className: 'status-rejected' },
};

export interface ComplaintDetails {
  id: number;
  reportedUserId: string;
  reportedUserName: string;
  reportedUserEmail: string;
  reportedByUserId: string;
  reportedByName: string;
  violationType: number;
  violationTypeText: string;
  description: string;
  status: number;
  statusText: string;
  relatedOrderId: string | null;
  relatedProductId: string | null;
  relatedBrandId: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  resolution: string | null;
  adminNotes: string | null;
  createdAt: string;
}

export interface CreateComplaintDto {
  reportedUserId: string;
  violationType: number;
  description: string;
  relatedOrderId?: string;
  relatedProductId?: string;
  relatedBrandId?: string;
  relatedContext?: string;
}
