export interface ProfileData {
  displayName: string;
  email: string;
  phoneNumber: string;
  profilePhotoUrl: string | null;
  businessName: string;
  businessDescription: string;
  businessAddress: string;
  businessLogoUrl: string | null;
  businessStatus: string;
  facebookLink: string;
  instagramLink: string;
  websiteLink: string;
}

export interface ProfileResponse {
  success: boolean;
  data: ProfileData;
  message: string;
  errors: string[] | null;
  timestamp: string;
}
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface LoginHistoryItem {
  ipAddress: string;
  deviceInfo: string;
  location: string;
  loginAt: string; // أو Date لو بتحوليها
  isSuccessful: boolean;
}

export interface LoginHistoryResponse {
  data: LoginHistoryItem[];
}

export interface RevokeSessionsRequest {
  currentRefreshToken: string;
}

export interface Preferences {
  timezone: string;
  dateFormat: string;
  currencyDisplay: string;
  dashboardLayout: string;
}