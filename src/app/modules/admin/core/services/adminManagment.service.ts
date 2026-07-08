import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse } from '../Interfaces/ibusiness-owner';
import { environment } from '../../../../core/environment/envirinment';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface AdminDto {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string | null;
    isActive: boolean;
    createdAt: string;
    role: string;
}

/** Matches backend: CreateAdminDto */
export interface CreateAdminDto {
    fullName: string;
    email: string;
    phoneNumber?: string;
    role: string;
}

/** Matches backend: EditAdminDto */
export interface EditAdminDto {
    fullName: string;
    email: string;
    phoneNumber?: string;
}

/** @deprecated Use EditAdminDto. Kept for backward compatibility. */
export type UpdateAdminDto = EditAdminDto;

/** Matches backend: ChangeAdminRoleDto */
export interface ChangeAdminRoleDto {
    role: string;
}

/** @deprecated Use ChangeAdminRoleDto. Kept for backward compatibility. */
export type UpdateAdminRoleDto = ChangeAdminRoleDto;

/** Matches backend: ResetAdminPasswordDto */
export interface ResetAdminPasswordDto {
    newPassword: string;
    confirmNewPassword: string;
}

/** @deprecated Use ResetAdminPasswordDto. Kept for backward compatibility. */
export type ResetPasswordDto = ResetAdminPasswordDto;

export interface SecuritySettings {
    id: number;
    passwordRequiredLength: number;
    passwordRequireDigit: boolean;
    passwordRequireLowercase: boolean;
    passwordRequireUppercase: boolean;
    passwordRequireNonAlphanumeric: boolean;
    sessionTimeoutInMinutes: number;
    maxFailedAccessAttempts: number;
    lockoutDurationInMinutes: number;
    requireTwoFactorForAdmins: boolean;
    ipWhitelist: string;
    allowedLoginStartTime: string;
    allowedLoginEndTime: string;
}

export interface UpdateSecuritySettingsDto {
    passwordRequiredLength: number;
    passwordRequireDigit: boolean;
    passwordRequireLowercase: boolean;
    passwordRequireUppercase: boolean;
    passwordRequireNonAlphanumeric: boolean;
    sessionTimeoutInMinutes: number;
    maxFailedAccessAttempts: number;
    lockoutDurationInMinutes: number;
    requireTwoFactorForAdmins: boolean;
    ipWhitelist: string;
    allowedLoginStartTime: string;
    allowedLoginEndTime: string;
}

export interface AuditLog {
    id: number;
    action: string;
    reason: string;
    notes: string;
    actionDate: string;
    adminName: string;
    adminEmail: string;
    userId: string;
    adminId: string;
    ipAddress: string;
    entityType: string;
    entityId: string;
    beforeValues: string;
    afterValues: string;
}

export interface AuditLogQuery {
    AdminId?: string;
    Action?: string;
    StartDate?: string;
    EndDate?: string;
    PageIndex?: number;
    PageSize?: number;
}

export interface LoginHistory {
    id: number;
    userId: string;
    userEmail: string;
    userDisplayName: string;
    ipAddress: string;
    deviceInfo: string;
    location: string;
    loginAt: string;
    isSuccessful: boolean;
    status: string;
    failureReason: string;
    userAgent: string;
    device: string;
}

export interface LoginHistoryQuery {
    UserId?: string;
    Email?: string;
    IsSuccessful?: boolean;
    IpAddress?: string;
    StartDate?: string;
    EndDate?: string;
    PageIndex?: number;
    PageSize?: number;
}

export interface RolePermissions {
    role: string;
    permissions: string[];
}

// ─────────────────────────────────────────────────────────────────────────────

@Injectable({
    providedIn: 'root'
})
export class AdminManagementService {
    private readonly baseUrl = `${environment.baseUrl}/api/admin-management`;

    constructor(private http: HttpClient) { }

    // ── Admins ────────────────────────────────────────────────────────────────

    getAllAdmins(): Observable<ApiResponse<AdminDto[]>> {
        return this.http.get<ApiResponse<AdminDto[]>>(`${this.baseUrl}/admins`);
    }

    createAdmin(dto: CreateAdminDto): Observable<ApiResponse<AdminDto>> {
        return this.http.post<ApiResponse<AdminDto>>(`${this.baseUrl}/create`, dto);
    }

    /** PUT /api/admin-management/admins/{adminId} — body: EditAdminDto */
    updateAdmin(adminId: string, dto: EditAdminDto): Observable<ApiResponse<AdminDto>> {
        return this.http.put<ApiResponse<AdminDto>>(`${this.baseUrl}/admins/${adminId}`, dto);
    }

    /** PUT /api/admin-management/admins/{adminId}/role — body: ChangeAdminRoleDto */
    updateAdminRole(adminId: string, dto: ChangeAdminRoleDto): Observable<ApiResponse<AdminDto>> {
        return this.http.put<ApiResponse<AdminDto>>(`${this.baseUrl}/admins/${adminId}/role`, dto);
    }

    /** POST /api/admin-management/admins/{adminId}/reset-password — body: ResetAdminPasswordDto */
    resetAdminPassword(adminId: string, dto: ResetAdminPasswordDto): Observable<ApiResponse<string>> {
        return this.http.post<ApiResponse<string>>(`${this.baseUrl}/admins/${adminId}/reset-password`, dto);
    }


    /** POST /api/admin-management/admins/{adminId}/deactivate */
    deactivateAdmin(adminId: string): Observable<ApiResponse<object>> {
        return this.http.post<ApiResponse<object>>(`${this.baseUrl}/admins/${adminId}/deactivate`, {});
    }

    /** POST /api/admin-management/admins/{adminId}/reactivate */
    reactivateAdmin(adminId: string): Observable<ApiResponse<object>> {
        return this.http.post<ApiResponse<object>>(`${this.baseUrl}/admins/${adminId}/reactivate`, {});
    }

    /** POST /api/admin-management/admins/{adminId}/revoke-sessions */
    revokeAdminSessions(adminId: string): Observable<ApiResponse<object>> {
        return this.http.post<ApiResponse<object>>(`${this.baseUrl}/admins/${adminId}/revoke-sessions`, {});
    }

    /** POST /api/admin-management/admins/{adminId}/unlock */
    unlockAdmin(adminId: string): Observable<ApiResponse<object>> {
        return this.http.post<ApiResponse<object>>(`${this.baseUrl}/admins/${adminId}/unlock`, {});
    }

    // ── Roles ─────────────────────────────────────────────────────────────────

    getRoles(): Observable<ApiResponse<RolePermissions[]>> {
        return this.http.get<ApiResponse<RolePermissions[]>>(`${this.baseUrl}/roles`);
    }

    // ── Security Settings ─────────────────────────────────────────────────────

    getSecuritySettings(): Observable<ApiResponse<SecuritySettings>> {
        return this.http.get<ApiResponse<SecuritySettings>>(`${this.baseUrl}/security-settings`);
    }

    updateSecuritySettings(dto: UpdateSecuritySettingsDto): Observable<ApiResponse<SecuritySettings>> {
        return this.http.put<ApiResponse<SecuritySettings>>(`${this.baseUrl}/security-settings`, dto);
    }

    // ── Audit Logs ────────────────────────────────────────────────────────────

    getAuditLogs(query?: AuditLogQuery): Observable<ApiResponse<PaginatedResponse<AuditLog>>> {
        let params = new HttpParams();
        if (query) {
            if (query.AdminId) params = params.set('AdminId', query.AdminId);
            if (query.Action) params = params.set('Action', query.Action);
            if (query.StartDate) params = params.set('StartDate', query.StartDate);
            if (query.EndDate) params = params.set('EndDate', query.EndDate);
            if (query.PageIndex) params = params.set('PageIndex', String(query.PageIndex));
            if (query.PageSize) params = params.set('PageSize', String(query.PageSize));
        }
        return this.http.get<ApiResponse<PaginatedResponse<AuditLog>>>(`${this.baseUrl}/audit-logs`, { params });
    }

    exportAuditLogs(query?: AuditLogQuery): Observable<string> {
        let params = new HttpParams();
        if (query) {
            if (query.AdminId) params = params.set('AdminId', query.AdminId);
            if (query.Action) params = params.set('Action', query.Action);
            if (query.StartDate) params = params.set('StartDate', query.StartDate);
            if (query.EndDate) params = params.set('EndDate', query.EndDate);
            if (query.PageIndex) params = params.set('PageIndex', String(query.PageIndex));
            if (query.PageSize) params = params.set('PageSize', String(query.PageSize));
        }
        return this.http.get(`${this.baseUrl}/audit-logs/export`, { params, responseType: 'text' });
    }

    // ── Login History ─────────────────────────────────────────────────────────

    getLoginHistory(query?: LoginHistoryQuery): Observable<ApiResponse<PaginatedResponse<LoginHistory>>> {
        let params = new HttpParams();
        if (query) {
            if (query.UserId) params = params.set('UserId', query.UserId);
            if (query.Email) params = params.set('Email', query.Email);
            if (query.IpAddress) params = params.set('IpAddress', query.IpAddress);
            if (query.StartDate) params = params.set('StartDate', query.StartDate);
            if (query.EndDate) params = params.set('EndDate', query.EndDate);
            if (query.PageIndex) params = params.set('PageIndex', String(query.PageIndex));
            if (query.PageSize) params = params.set('PageSize', String(query.PageSize));
            if (query.IsSuccessful !== undefined)
                params = params.set('IsSuccessful', String(query.IsSuccessful));
        }
        return this.http.get<ApiResponse<PaginatedResponse<LoginHistory>>>(`${this.baseUrl}/login-history`, { params });
    }

    exportLoginHistory(query?: LoginHistoryQuery): Observable<string> {
        let params = new HttpParams();
        if (query) {
            if (query.UserId) params = params.set('UserId', query.UserId);
            if (query.Email) params = params.set('Email', query.Email);
            if (query.IpAddress) params = params.set('IpAddress', query.IpAddress);
            if (query.StartDate) params = params.set('StartDate', query.StartDate);
            if (query.EndDate) params = params.set('EndDate', query.EndDate);
            if (query.PageIndex) params = params.set('PageIndex', String(query.PageIndex));
            if (query.PageSize) params = params.set('PageSize', String(query.PageSize));
            if (query.IsSuccessful !== undefined)
                params = params.set('IsSuccessful', String(query.IsSuccessful));
        }
        return this.http.get(`${this.baseUrl}/login-history/export`, { params, responseType: 'text' });
    }
}