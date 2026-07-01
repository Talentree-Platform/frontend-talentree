export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
    errors: string[];
    timestamp: string;
}

export interface SecurityStatus {
    isTwoFactorEnabled: boolean;
    mustChangePassword: boolean;
    failedAttempts: number;
    lockoutEnd: string;
    lastLoginDate: string;
    lastLoginIp: string;
    activeSessionCount: number;
}

export interface AccountPermissions {
    role: string;
    permissions: string[];
}

export interface ConfirmEnable2FARequest {
    otpCode: string;
}