import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../core/environment/envirinment';
import {
    ApiResponse,
    SecurityStatus,
    AccountPermissions,
    ConfirmEnable2FARequest,
} from './account.models';

@Injectable({
    providedIn: 'root',
})
export class AccountService {
    private apiUrl = environment.baseUrl;

    constructor(private http: HttpClient) { }

    getSecurityStatus(): Observable<ApiResponse<SecurityStatus>> {
        return this.http.get<ApiResponse<SecurityStatus>>(
            `${this.apiUrl}/api/account/security-status`
        );
    }

    getPermissions(): Observable<ApiResponse<AccountPermissions>> {
        return this.http.get<ApiResponse<AccountPermissions>>(
            `${this.apiUrl}/api/account/me/permissions`
        );
    }

    requestEnable2FA(): Observable<ApiResponse<string>> {
        return this.http.post<ApiResponse<string>>(
            `${this.apiUrl}/api/account/request-enable-2fa`,
            {}
        );
    }

    confirmEnable2FA(
        payload: ConfirmEnable2FARequest
    ): Observable<ApiResponse<string>> {
        return this.http.post<ApiResponse<string>>(
            `${this.apiUrl}/api/account/confirm-enable-2fa`,
            payload
        );
    }

    disable2FA(): Observable<ApiResponse<string>> {
        return this.http.post<ApiResponse<string>>(
            `${this.apiUrl}/api/account/disable-2fa`,
            {}
        );
    }
}