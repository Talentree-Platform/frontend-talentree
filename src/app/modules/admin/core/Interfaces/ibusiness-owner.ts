export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors: string[];
  timestamp: string;
}
export interface PaginatedResponse<T> {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: T[];
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  firstItemIndex: number;
  lastItemIndex: number;
}

export interface BusinessOwner {
  profileId: number;
  userId: string;
  ownerName: string;
  email: string;
  phoneNumber: string;

  businessName: string;
  businessCategory: string;
  businessDescription: string;
  businessAddress: string;

  taxId: string;

  facebookLink: string;
  instagramLink: string;
  websiteLink: string;

  status: number;
  statusText: string;

  submittedAt: string;
  autoApprovalDeadline: string;
  willAutoApprove: boolean;
  timeUntilAutoApproval: string;

  approvedAt: string;
  approvedBy: string;

  rejectionReason: string;
}
