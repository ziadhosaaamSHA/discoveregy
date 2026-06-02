const ACCESS_TOKEN_KEY = "degy_access_token";
const REFRESH_TOKEN_KEY = "degy_refresh_token";
const AUTH_ROLE_KEY = "degy_auth_role";
const ROLE_KEYS = ["tourist", "guide", "admin"];

/**
 * Normalizes any role-like value into the three supported frontend role keys.
 * Returning null lets callers clear invalid or unknown role state safely.
 */
export function normalizeRole(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return ROLE_KEYS.includes(normalized) ? normalized : null;
}

/**
 * Creates a role-specific localStorage key.
 * This allows tourist, guide, and admin sessions to coexist without overwriting each other.
 */
function getRoleTokenKey(baseKey, role) {
  return `${baseKey}_${role}`;
}

/**
 * Reads the role currently selected for authenticated API requests.
 */
export function getActiveAuthRole() {
  return normalizeRole(localStorage.getItem(AUTH_ROLE_KEY));
}

/**
 * Persists the active role used by token readers and route guards.
 */
export function setActiveAuthRole(role) {
  const normalizedRole = normalizeRole(role);
  if (!normalizedRole) {
    localStorage.removeItem(AUTH_ROLE_KEY);
    return;
  }
  localStorage.setItem(AUTH_ROLE_KEY, normalizedRole);
}

/**
 * Extracts access and refresh tokens from the different response shapes the backend may return.
 * Keeping this here prevents every auth caller from checking `token`, `jwt`, and snake_case keys.
 */
export function readTokensFromPayload(payload) {
  const source = payload && typeof payload === "object" ? payload : {};
  const accessToken =
    source.accessToken ??
    source.token ??
    source.jwt ??
    source.access_token ??
    source?.data?.accessToken ??
    source?.data?.token ??
    null;
  const refreshToken =
    source.refreshToken ??
    source.refresh_token ??
    source?.data?.refreshToken ??
    source?.data?.refresh_token ??
    null;

  return {
    accessToken: typeof accessToken === "string" ? accessToken : null,
    refreshToken: typeof refreshToken === "string" ? refreshToken : null,
  };
}

/**
 * Reads the access token for a role, falling back to the legacy shared token key.
 * The fallback keeps old sessions valid while the app uses role-aware storage.
 */
export function getAccessToken(role = getActiveAuthRole()) {
  const normalizedRole = normalizeRole(role);
  let token = null;
  if (normalizedRole) {
    token = localStorage.getItem(getRoleTokenKey(ACCESS_TOKEN_KEY, normalizedRole));
  }
  if (!token) {
    token = localStorage.getItem(ACCESS_TOKEN_KEY);
  }
  if (token === "null" || token === "undefined") return null;
  return token;
}

/**
 * Reads the refresh token for a role, falling back to the legacy shared refresh key.
 */
export function getRefreshToken(role = getActiveAuthRole()) {
  const normalizedRole = normalizeRole(role);
  let token = null;
  if (normalizedRole) {
    token = localStorage.getItem(getRoleTokenKey(REFRESH_TOKEN_KEY, normalizedRole));
  }
  if (!token) {
    token = localStorage.getItem(REFRESH_TOKEN_KEY);
  }
  if (token === "null" || token === "undefined") return null;
  return token;
}

/**
 * Persists tokens in both legacy and role-specific keys.
 * This keeps existing imports working while preventing cross-role token collisions.
 */
export function setAuthTokens({ accessToken, refreshToken, role }) {
  const normalizedRole = normalizeRole(role);
  if (normalizedRole) setActiveAuthRole(normalizedRole);
  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  if (normalizedRole && accessToken) {
    localStorage.setItem(getRoleTokenKey(ACCESS_TOKEN_KEY, normalizedRole), accessToken);
  }
  if (normalizedRole && refreshToken) {
    localStorage.setItem(getRoleTokenKey(REFRESH_TOKEN_KEY, normalizedRole), refreshToken);
  }
}

/**
 * Clears all known auth token keys for every role.
 * Used on logout, account deletion, and failed refresh.
 */
export function clearAuthTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(AUTH_ROLE_KEY);
  ROLE_KEYS.forEach((role) => {
    localStorage.removeItem(getRoleTokenKey(ACCESS_TOKEN_KEY, role));
    localStorage.removeItem(getRoleTokenKey(REFRESH_TOKEN_KEY, role));
  });
}
