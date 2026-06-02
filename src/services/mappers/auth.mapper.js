import { extractPayload } from "../contracts";
import { parseAuthPayload, parseUserProfile } from "../contracts/auth.contract";

/**
 * Converts backend/frontend role variants into the lowercase role used by the app.
 * Unknown values default to tourist because public auth flows should remain usable.
 */
export function normalizeAuthRole(value) {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "guide") return "guide";
  if (normalized === "admin") return "admin";
  return "tourist";
}

/**
 * Decodes the payload segment of a JWT without verifying the signature.
 * This is used only for reading non-sensitive role claims already issued by the backend.
 */
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

/**
 * Reads role claims from common .NET/JWT claim names.
 * Login uses this when the auth response contains tokens but no user profile object.
 */
export function inferRoleFromToken(accessToken) {
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
  return normalizeAuthRole(roleValue);
}

/**
 * Picks the best human display name from a flexible backend profile.
 * Email is used only as a fallback so headers do not show email when a name exists.
 */
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

/**
 * Converts a backend profile response into the small user object used by AuthContext.
 */
export function normalizeUser(profile) {
  if (!profile || typeof profile !== "object") return null;
  const parsedProfile = parseUserProfile(profile);
  const roleSource = parsedProfile.role ?? parsedProfile.userRole ?? parsedProfile.type;
  const role = roleSource === undefined || roleSource === null || roleSource === ""
    ? null
    : normalizeAuthRole(roleSource);

  return {
    id: String(parsedProfile.id ?? parsedProfile.userId ?? parsedProfile.userID ?? ""),
    name: resolveName(parsedProfile),
    email: parsedProfile.email || "",
    type: role,
  };
}

/**
 * Converts different backend auth envelopes into the shape used by AuthContext.
 */
export function readAuthResponse(data) {
  const payload = parseAuthPayload(extractPayload(data) || {});
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
