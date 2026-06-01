const DEFAULT_API_BASE_URL =
  "https://tourism-api-sha-e7g5guagcdc2dddv.westeurope-01.azurewebsites.net";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "" : DEFAULT_API_BASE_URL)
).replace(/\/+$/, "");

const ACCESS_TOKEN_KEY = "degy_access_token";
const REFRESH_TOKEN_KEY = "degy_refresh_token";
const AUTH_ROLE_KEY = "degy_auth_role";
const ROLE_KEYS = ["tourist", "guide", "admin"];

let refreshPromise = null;

function normalizeRole(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return ROLE_KEYS.includes(normalized) ? normalized : null;
}

function getRoleTokenKey(baseKey, role) {
  return `${baseKey}_${role}`;
}

export function getActiveAuthRole() {
  return normalizeRole(localStorage.getItem(AUTH_ROLE_KEY));
}

export function setActiveAuthRole(role) {
  const normalizedRole = normalizeRole(role);
  if (!normalizedRole) {
    localStorage.removeItem(AUTH_ROLE_KEY);
    return;
  }
  localStorage.setItem(AUTH_ROLE_KEY, normalizedRole);
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function toUrl(path) {
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function resolveApiAssetUrl(path) {
  if (typeof path !== "string") return "";
  const trimmed = path.trim();
  if (!trimmed) return "";
  return toUrl(trimmed);
}

function parseJsonSafely(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function readTokensFromPayload(payload) {
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

export function clearAuthTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(AUTH_ROLE_KEY);
  ROLE_KEYS.forEach((role) => {
    localStorage.removeItem(getRoleTokenKey(ACCESS_TOKEN_KEY, role));
    localStorage.removeItem(getRoleTokenKey(REFRESH_TOKEN_KEY, role));
  });
}

async function parseResponse(response) {
  const text = await response.text();
  const json = parseJsonSafely(text);
  return json ?? text ?? null;
}

async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;

  const authRole = getActiveAuthRole();
  const refreshToken = getRefreshToken(authRole);
  if (!refreshToken) throw new ApiError("Session expired. Please login again.", 401, null);

  refreshPromise = (async () => {
    const response = await fetch(toUrl("/api/auth/refresh"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(refreshToken),
    });

    const data = await parseResponse(response);
    if (!response.ok) {
      throw new ApiError("Failed to refresh session.", response.status, data);
    }

    const tokens = readTokensFromPayload(data);
    if (!tokens.accessToken) {
      throw new ApiError("Refresh response did not include a new access token.", 500, data);
    }

    setAuthTokens({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken ?? refreshToken,
      role: authRole,
    });

    return tokens.accessToken;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

async function apiRequestInternal(path, options = {}, retry = true) {
  const {
    method = "GET",
    auth = true,
    headers = {},
    body,
  } = options;
  // Caching: opt-in per-request using options.cache when the feature flag is enabled
  const ENABLE_API_CACHE = import.meta.env.VITE_ENABLE_API_CACHE === "true";
  const cacheOption = options.cache || false;
  const cacheTTL = typeof options.cacheTTL === "number" ? options.cacheTTL : 5 * 60 * 1000; // default 5 minutes

  // Simple in-memory cache map: key -> { expiresAt, data }
  if (!globalThis.__degyApiCache) globalThis.__degyApiCache = new Map();
  const cacheMap = globalThis.__degyApiCache;

  function makeCacheKey(p, opts) {
    // Only cache GET requests; include method, url, and body for uniqueness
    const m = (opts.method || "GET").toUpperCase();
    let b = "";
    try {
      if (opts.body && typeof opts.body === "string") b = opts.body;
      else if (opts.body && typeof opts.body === "object") b = JSON.stringify(opts.body);
    } catch {
      b = String(opts.body || "");
    }
    return `${m}::${toUrl(p)}::${b}`;
  }

  const requestHeaders = { Accept: "application/json", ...headers };
  const finalOptions = { method, headers: requestHeaders };

  if (auth) {
    const token = getAccessToken();
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  // Try cache for GET requests when enabled and requested
  const isGet = (method || "GET").toUpperCase() === "GET";
  const shouldUseCache = ENABLE_API_CACHE && cacheOption && isGet;
  const cacheKey = shouldUseCache ? makeCacheKey(path, { method, body }) : null;
  if (shouldUseCache && cacheKey) {
    const entry = cacheMap.get(cacheKey);
    if (entry && entry.expiresAt > Date.now()) {
      return entry.data;
    }
  }

  if (body !== undefined) {
    if (body instanceof FormData) {
      finalOptions.body = body;
    } else if (typeof body === "string") {
      requestHeaders["Content-Type"] = requestHeaders["Content-Type"] || "application/json";
      finalOptions.body = body;
    } else {
      requestHeaders["Content-Type"] = requestHeaders["Content-Type"] || "application/json";
      finalOptions.body = JSON.stringify(body);
    }
  }

  const response = await fetch(toUrl(path), finalOptions);
  const data = await parseResponse(response);

  if (!response.ok) {
    if (response.status === 401 && auth && retry && getRefreshToken()) {
      try {
        await refreshAccessToken();
      } catch {
        clearAuthTokens();
        throw new ApiError("Session expired. Please login again.", 401, data);
      }
      return apiRequest(path, options, false);
    }

    const message =
      (data && typeof data === "object" && (data.message || data.title || data.error || data.detail)) ||
      `Request failed (${response.status})`;

    throw new ApiError(message, response.status, data);
  }

  return data;
}

// Cache helpers
export function clearApiCache(keyPrefix) {
  if (!globalThis.__degyApiCache) return;
  if (!keyPrefix) {
    globalThis.__degyApiCache.clear();
    return;
  }
  for (const k of Array.from(globalThis.__degyApiCache.keys())) {
    if (k.startsWith(keyPrefix)) globalThis.__degyApiCache.delete(k);
  }
}

export function setApiCache(path, options, data, ttl = 5 * 60 * 1000) {
  const cacheMap = globalThis.__degyApiCache || new Map();
  globalThis.__degyApiCache = cacheMap;
  const key = `${(options.method || "GET").toUpperCase()}::${toUrl(path)}::${typeof options.body === 'string' ? options.body : JSON.stringify(options.body || {})}`;
  cacheMap.set(key, { expiresAt: Date.now() + ttl, data });
}

// Wrap fetch with optional cache set when successful
const originalApiRequest = apiRequestInternal;
// We replace exported apiRequest with a wrapper that will set cache entries when requested
export async function apiRequestWithCache(path, options = {}, retry = true) {
  const res = await originalApiRequest(path, options, retry);
  try {
    const ENABLE_API_CACHE = import.meta.env.VITE_ENABLE_API_CACHE === "true";
    const cacheOption = options.cache || false;
    const cacheTTL = typeof options.cacheTTL === "number" ? options.cacheTTL : 5 * 60 * 1000;
    const isGet = (options.method || "GET").toUpperCase() === "GET";
    if (ENABLE_API_CACHE && cacheOption && isGet) {
      setApiCache(path, options, res, cacheTTL);
    }
  } catch (e) {
    // ignore cache set errors
  }
  return res;
}

// Re-export apiRequest name used by other modules
export { apiRequestWithCache as apiRequest };

export function unwrapPayload(responseData) {
  if (!responseData || typeof responseData !== "object") return responseData;
  if ("data" in responseData) return responseData.data;
  if ("result" in responseData) return responseData.result;
  return responseData;
}

