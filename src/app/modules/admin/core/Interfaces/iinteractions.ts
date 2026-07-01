// ── Interfaces ────────────────────────────────────────────────────────────────
// Based on the REAL response schema from Swagger for
// GET /api/admin/interactions/{userId}
//
// NOTE: The backend does NOT currently return userName, ipAddress,
// deviceInfo, or metadata — only the fields below. If the backend adds
// these later, extend this interface and the template accordingly.

export interface InteractionItem {
  id: number;
  userId: string;
  userType: string;
  itemId: number;
  itemType: string;
  actionType: string;
  category: string;
  quantity: number;
  price: number;
  interactionTimestamp: string;
  createdAt: string;
}

// GET /api/admin/interactions/{userId} query params
// (Swagger only documents `pageIndex` for this endpoint — no pageSize,
// search, or sort params are supported server-side.)
export interface InteractionFilterParams {
  pageIndex?: number;
}

// GET /api/admin/interactions/export query params
export interface InteractionExportParams {
  fromDate?: string;
  toDate?: string;
}