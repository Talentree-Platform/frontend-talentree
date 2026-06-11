import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { ProfileResponse } from '../interfaces/i-setting';
import {
  ChangePasswordRequest,
  LoginHistoryResponse,
  RevokeSessionsRequest,
  Preferences
} from '../interfaces/i-setting';

@Injectable({
  providedIn: 'root'
})
export class OwnerSettingService {

  private baseUrl = '/api/BusinessOwnerAccountSettings';

  constructor(private http: HttpClient) {}

  // ================= PROFILE =================

  getCurrentProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.baseUrl}/profile`);
  }

  updateProfile(formValue: any, profilePhoto?: File, businessLogo?: File): Observable<ProfileResponse> {

    const formData = new FormData();

    if (formValue.firstName)
      formData.append('FirstName', formValue.firstName);

    if (formValue.lastName)
      formData.append('LastName', formValue.lastName);

    if (formValue.phoneNumber)
      formData.append('PhoneNumber', formValue.phoneNumber);

    if (formValue.email)
      formData.append('NewEmail', formValue.email);

    if (formValue.businessName)
      formData.append('BusinessName', formValue.businessName);

    if (formValue.description)
      formData.append('BusinessDescription', formValue.description);

    if (formValue.address)
      formData.append('BusinessAddress', formValue.address);

    if (formValue.facebook)
      formData.append('FacebookLink', formValue.facebook);

    if (formValue.instagram)
      formData.append('InstagramLink', formValue.instagram);

    if (formValue.website)
      formData.append('WebsiteLink', formValue.website);

    if (profilePhoto)
      formData.append('ProfilePhoto', profilePhoto);

    if (businessLogo)
      formData.append('BusinessLogo', businessLogo);

    return this.http.put<ProfileResponse>(
      `${this.baseUrl}/profile`,
      formData
    );
  }

  // ================= PAYMENT INFO =================

  getPaymentInfo(currentPassword: string): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/payment-info/view`,
      { currentPassword }
    );
  }

  updatePaymentInfo(paymentData: {
    currentPassword: string;
    bankName: string;
    accountHolderName: string;
    accountNumber: string;
    routingSwiftCode: string;
  }): Observable<any> {

    return this.http.put<any>(
      `${this.baseUrl}/payment-info`,
      paymentData
    );
  }

  // ======================================================
  // 🔐 SECURITY APIs
  // ======================================================

  changePassword(payload: ChangePasswordRequest): Observable<any> {
    return this.http.put<any>(
      `${this.baseUrl}/security/change-password`,
      payload
    );
  }

  getLoginHistory(pageIndex: number = 1, pageSize: number = 20): Observable<LoginHistoryResponse> {

    return this.http.get<LoginHistoryResponse>(
      `${this.baseUrl}/security/login-history`,
      {
        params: {
          pageIndex,
          pageSize
        }
      }
    );
  }

  revokeOtherSessions(payload: RevokeSessionsRequest): Observable<any> {

    return this.http.post<any>(
      `${this.baseUrl}/security/revoke-other-sessions`,
      payload
    );
  }

  // ======================================================
  // ⚙️ PREFERENCES APIs
  // ======================================================

  getPreferences(): Observable<{ data: Preferences }> {
    return this.http.get<{ data: Preferences }>(
      `${this.baseUrl}/preferences`
    );
  }

  updatePreferences(payload: Preferences): Observable<{ data: Preferences }> {

    return this.http.put<{ data: Preferences }>(
      `${this.baseUrl}/preferences`,
      payload
    );
  }
}