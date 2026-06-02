import {
  apiRequest,
  clearAuthTokens,
  getActiveAuthRole,
  getRefreshToken,
  setAuthTokens,
  unwrapPayload,
} from "./api-client";

function normalizeRole(value) {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "guide") return "guide";
  if (normalized === "admin") return "admin";
  return "tourist";
}

function decodeJwtPayload(token) {
  if (typeof token !== "string" || !token.includes(".")) return null;
  const segments = token.split(".");
  if (segments.length < 2) return null;
  try {
    const payload = segments[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload.padEnd(Math.ceil(payload.length / 4) * 4, "=");
    const decoded = atob(padded);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function inferRoleFromToken(accessToken) {
  const claims = decodeJwtPayload(accessToken);
  if (!claims || typeof claims !== "object") return null;

  const roleClaim =
    claims.role ??
    claims.roles ??
    claims["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
    claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"] ??
    null;

  const roleValue = Array.isArray(roleClaim) ? roleClaim[0] : roleClaim;
  if (!roleValue) return null;
  return normalizeRole(roleValue);
}

function resolveName(profile) {
  const firstName = profile.firstName || "";
  const lastName = profile.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();
  const candidates = [
    fullName,
    profile.fullName,
    profile.displayName,
    profile.name,
    profile.userName,
    profile.username,
  ];

  const name = candidates
    .map((value) => String(value || "").trim())
    .find((value) => value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));

  return name || profile.email || "User";
}

function normalizeUser(profile) {
  if (!profile || typeof profile !== "object") return null;
  const roleSource = profile.role ?? profile.userRole ?? profile.type;
  const role = roleSource === undefined || roleSource === null || roleSource === ""
    ? null
    : normalizeRole(roleSource);

  return {
    id: String(profile.id ?? profile.userId ?? profile.userID ?? ""),
    name: resolveName(profile),
    email: profile.email || "",
    type: role,
  };
}

function readAuthResponse(data) {
  const payload = unwrapPayload(data) || {};
  const accessToken = payload.accessToken ?? payload.token ?? payload.jwt ?? payload.access_token ?? null;
  const refreshToken = payload.refreshToken ?? payload.refresh_token ?? null;
  const user = normalizeUser(payload.user || payload.profile || payload);
  const roleFromToken = inferRoleFromToken(accessToken);

  return {
    accessToken: typeof accessToken === "string" ? accessToken : null,
    refreshToken: typeof refreshToken === "string" ? refreshToken : null,
    user: user ? { ...user, type: user.type || roleFromToken || "tourist" } : null,
    role: roleFromToken || user?.type || null,
  };
}

function extractArray(data) {
  const payload = unwrapPayload(data);
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.items)) return payload.items;
  return [];
}

export async function loginApi(email, password) {
  const data = await apiRequest("/api/auth/login", {
    method: "POST",
    body: { email, password },
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

export async function socialLoginApi({ token, provider }) {
  const data = await apiRequest("/api/auth/social-login", {
    method: "POST",
    body: { token, provider },
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

export async function fetchMyProfile() {
  const data = await apiRequest("/api/users/my-profile", { method: "GET" });
  const payload = unwrapPayload(data);
  const user = normalizeUser(payload);
  if (!user) throw new Error("Failed to load user profile.");
  return {
    ...user,
    type: user.type || getActiveAuthRole() || "tourist",
  };
}

export async function fetchNationalities() {
  const data = await apiRequest("/api/nationalities", { method: "GET", auth: false });
  return extractArray(data);
}

export async function fetchNationalityById(id) {
  const data = await apiRequest(`/api/nationalities/${id}`, { method: "GET", auth: false });
  const payload = unwrapPayload(data);
  if (!payload || typeof payload !== "object") {
    throw new Error("Failed to load nationality details.");
  }
  return payload;
}

export async function resolveNationalityId(nationalityValue) {
  const normalized = String(nationalityValue || "").trim();
  if (!normalized) throw new Error("Nationality is required.");

  const numericId = Number(normalized);
  if (Number.isInteger(numericId) && numericId > 0) {
    await fetchNationalityById(numericId);
    return numericId;
  }

  const nationalities = await fetchNationalities();
  const match = nationalities.find((item) => {
    const name = String(item?.name || item?.title || "").trim().toLowerCase();
    return name === normalized.toLowerCase();
  });

  if (!match || typeof match.id !== "number") {
    throw new Error("Could not match selected nationality with backend data.");
  }

  await fetchNationalityById(match.id);
  return match.id;
}

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

export async function forgotPasswordApi(email) {
  return apiRequest("/api/auth/forgot-password", {
    method: "POST",
    body: { email },
    auth: false,
  });
}

export async function resetPasswordApi({ email, otp, newPassword }) {
  return apiRequest("/api/auth/reset-password", {
    method: "POST",
    body: { email, otp, newPassword },
    auth: false,
  });
}

export async function updateMyProfileApi({ userName, phoneNumber }) {
  return apiRequest("/api/users/update", {
    method: "PUT",
    body: { userName, phoneNumber },
  });
}

export async function changePasswordApi({ currentPassword, newPassword }) {
  return apiRequest("/api/users/change-password", {
    method: "PUT",
    body: { currentPassword, newPassword },
  });
}

export async function deleteMyAccountApi() {
  return apiRequest("/api/users/delete", {
    method: "DELETE",
  });
}
