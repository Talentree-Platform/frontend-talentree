// src/app/core/constants/roles.constants.ts

export enum UserRole {
  SuperAdmin = 'SuperAdmin',
  Admin = 'Admin',
  SupportStaff = 'SupportStaff',
  ContentManager = 'ContentManager',
  BusinessOwner = 'BusinessOwner',
  Customer = 'Customer'
}

/**
 * Direct match only — NO role inheritance.
 * Per the backend authorization audit, SuperAdmin does NOT automatically
 * inherit Admin permissions except where explicitly documented
 * (AdminController, AdminAiProxyController, AdminTransactionsController,
 * AdminRefundsController, AdminOrdersController, RecommendationController/metrics).
 * Every route below lists its exact allowed roles explicitly.
 */
export function roleSatisfies(userRole: string | null | undefined, expectedRoles: string[]): boolean {
  if (!userRole || !expectedRoles?.length) return false;
  const normalized = userRole.trim().toLowerCase();
  return expectedRoles.some(expected => expected.trim().toLowerCase() === normalized);
}