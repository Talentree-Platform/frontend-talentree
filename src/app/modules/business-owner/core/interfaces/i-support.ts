// ─────────────────────────────────────────────
//  Support Module – TypeScript Interfaces
// ─────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors?: string[];
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

// ── Attachment ──────────────────────────────
export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;        // bytes
  contentType: string;
}

// ── Ticket Message ──────────────────────────
export interface TicketMessage {
  id: number;
  ticketId: number;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  isAdminMessage: boolean;
  content: string;
  attachments: Attachment[];
  createdAt: string;       // ISO date string
}

// ── Ticket (list item) ──────────────────────
export interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: number;
  statusText: string;
  category: number;
  categoryText: string;
  priority: number;
  priorityText: string;
  messageCount: number;
  attachmentCount: number;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  timeAgo: string;
}

// ── Assigned / Business owner info ─────────
export interface AssignedUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// ── Ticket Details ─────────
export interface TicketDetails {
  id: number;
  ticketNumber: string;
  subject: string;
  description: string;

  category: number;
  categoryText: string;

  status: number;
  statusText: string;

  priority: number;
  priorityText: string;

  messageCount: number;
  attachmentCount: number;

  createdAt: string;
  updatedAt: string;
  timeAgo: string;

  attachments: Attachment[];
  messages: TicketMessage[];

  businessOwnerUserId: string;
  businessOwnerName: string;
  businessOwnerEmail: string;

  assignedToAdminId: string | null;
  assignedAt: string | null;
  resolvedAt: string | null;
  resolvedBy: string | null;
  closedAt: string | null;
  closedBy: string | null;
}

// ── FAQ ─────────────────────────────────────
export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
  viewCount: number;
}

// ── FAQ Category ─────────────────────────────
export interface FaqCategory {
  category: string;
  count: number;
}

// ── Query Params ─────────────────────────────
export interface TicketListParams {
  pageNumber?: number;
  pageSize?: number;
  status?: number | null;
  category?: number | null;
  search?: string;
}

export interface FaqSearchParams {
  query?: string;
  category?: string;
}