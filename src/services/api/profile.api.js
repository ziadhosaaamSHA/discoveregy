import { apiRequest, getActiveAuthRole } from "../api-client";
import {
  extractPayload,
  validateChangePasswordRequest,
  validateUpdateUserRequest,
} from "../contracts";
import { normalizeUser } from "../mappers/auth.mapper";

/**
 * Profile endpoints are authenticated current-user operations.
 * Public login/register/reset-password operations live in auth.api.js.
 */

/**
 * Loads the current user's profile and normalizes it for AuthContext.
 */
export async function fetchMyProfile() {
  const data = await apiRequest("/api/users/my-profile", { method: "GET" });
  const payload = extractPayload(data);
  const user = normalizeUser(payload);
  if (!user) throw new Error("Failed to load user profile.");
  return {
    ...user,
    type: user.type || getActiveAuthRole() || "tourist",
  };
}

/**
 * Updates the current user's display/profile fields.
 */
export async function updateMyProfileApi({ userName, phoneNumber }) {
  const body = validateUpdateUserRequest({ userName, phoneNumber });
  return apiRequest("/api/users/update", {
    method: "PUT",
    body,
  });
}

/**
 * Changes the current user's password.
 * confirmNewPassword is filled from newPassword for older UI call sites.
 */
export async function changePasswordApi({ currentPassword, newPassword, confirmNewPassword }) {
  const body = validateChangePasswordRequest({
    currentPassword,
    newPassword,
    confirmNewPassword: confirmNewPassword || newPassword,
  });
  return apiRequest("/api/users/change-password", {
    method: "PUT",
    body,
  });
}

/**
 * Deletes the current authenticated account.
 */
export async function deleteMyAccountApi() {
  return apiRequest("/api/users/delete", {
    method: "DELETE",
  });
}
