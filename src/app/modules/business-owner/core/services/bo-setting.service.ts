import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {  ProfileResponse } from '../interfaces/i-setting';

@Injectable({
  providedIn: 'root'
})
export class BoSettingService {

  private baseUrl = 'https://backtalentree.runasp.net/api/BusinessOwnerAccountSettings';

  constructor(private http: HttpClient) {}

  getCurrentProfile():Observable<ProfileResponse>{
    return this.http.get<ProfileResponse>(`${this.baseUrl}/profile`);
  }
  updateProfile(
    formValue: any,
    profilePhoto?: File,
    businessLogo?: File
  ): Observable<ProfileResponse> {

    const formData = new FormData();

    // 🔹 text fields
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

    // 🔹 files
    if (profilePhoto) {
      formData.append('ProfilePhoto', profilePhoto);
    }

    if (businessLogo) {
      formData.append('BusinessLogo', businessLogo);
    }

    // 🔥 request
    return this.http.put<ProfileResponse>(
      `${this.baseUrl}/profile`,
      formData
    );
  }
}
