import {
  apiRequest,
  clearAuthTokens,
  getRefreshToken,
  setAuthTokens,
} from "../api-client";
import {
  validateLoginRequest,
  validateResetPasswordRequest,
  validateSocialLoginRequest,
} from "../contracts";
import { readAuthResponse } from "../mappers/auth.mapper";
import { fetchMyProfile } from "./profile.api";

/**
 * Auth endpoints handle public authentication and password recovery.
 * Profile-only user actions live in profile.api.js.
 */

/**
 * Logs in with email/password, stores returned tokens, then loads the canonical profile.
 */
export async function loginApi(email, password) {
  const body = validateLoginRequest({ email, password });
  const data = await apiRequest("/api/auth/login", {
    method: "POST",
    body,
    auth: false,
  });

  const auth = readAuthResponse(data);
  if (!auth.accessToken) {
    throw new Error("Login succeeded but access token was missing in response.");
  }

  setAuthTokens({
    accessToken: auth.accessToken,
    refreshToken: auth.refreshToken,
    role: auth.role,
  });

  try {
    const profile = await fetchMyProfile();
    setAuthTokens({ accessToken: auth.accessToken, refreshToken: auth.refreshToken, role: profile.type });
    return profile;
  } catch {
    if (auth.user) return auth.user;
    throw new Error("Login succeeded but profile could not be loaded.");
  }
}

/**
 * Logs in through a social provider token and then loads the canonical profile.
 */
export async function socialLoginApi({ token, provider }) {
  const body = validateSocialLoginRequest({ token, provider });
  const data = await apiRequest("/api/auth/social-login", {
    method: "POST",
    body,
    auth: false,
  });

  const auth = readAuthResponse(data);
  if (!auth.accessToken) {
    throw new Error("Social login succeeded but access token was missing in response.");
  }

  setAuthTokens({
    accessToken: auth.accessToken,
    refreshToken: auth.refreshToken,
    role: auth.role,
  });

  try {
    const profile = await fetchMyProfile();
    setAuthTokens({ accessToken: auth.accessToken, refreshToken: auth.refreshToken, role: profile.type });
    return profile;
  } catch {
    if (auth.user) return auth.user;
    throw new Error("Login succeeded but profile could not be loaded.");
  }
}

/**
 * Registers a tourist or guide account.
 * The backend expects multipart PascalCase fields, so this function builds FormData manually.
 */
export async function registerApi({
  firstName,
  lastName,
  email,
  phoneNumber,
  birthDate,
  gender,
  password,
  confirmPassword,
  nationalityId,
  role,
  languageIds,
  licenseNumber,
  licenseImage,
}) {
  const formData = new FormData();
  formData.append("FirstName", firstName);
  formData.append("LastName", lastName);
  formData.append("Email", email);
  formData.append("PhoneNumber", phoneNumber);
  formData.append("BirthDate", new Date(birthDate).toISOString());
  formData.append("Gender", gender);
  formData.append("Password", password);
  formData.append("ConfirmPassword", confirmPassword);
  formData.append("NationalityId", String(nationalityId));
  formData.append("Role", role);

  if (Array.isArray(languageIds)) {
    languageIds.forEach((id) => formData.append("LanguageIds", String(id)));
  }
  if (licenseNumber) formData.append("LicenseNumber", licenseNumber);
  if (licenseImage) formData.append("LicenseImage", licenseImage);

  return apiRequest("/api/auth/register", {
    method: "POST",
    body: formData,
    auth: false,
  });
}

/**
 * Logs out locally and asks the backend to revoke the current refresh token when available.
 */
export async function logoutApi() {
  const refreshToken = getRefreshToken();
  try {
    await apiRequest("/api/auth/logout", { method: "POST" });
    if (refreshToken) {
      await apiRequest("/api/auth/revoke-token", {
        method: "POST",
        body: JSON.stringify(refreshToken),
        auth: false,
      });
    }
  } finally {
    clearAuthTokens();
  }
}

/**
 * Starts password reset by sending an OTP to the user's email.
 */
export async function forgotPasswordApi(email) {
  return apiRequest("/api/auth/forgot-password", {
    method: "POST",
    body: { email },
    auth: false,
  });
}

/**
 * Finishes password reset using email, OTP, and the new password.
 */
export async function resetPasswordApi({ email, otp, newPassword }) {
  const body = validateResetPasswordRequest({ email, otp, newPassword });
  return apiRequest("/api/auth/reset-password", {
    method: "POST",
    body,
    auth: false,
  });
}
