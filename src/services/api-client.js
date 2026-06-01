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

export async function apiRequest(path, options = {}, retry = true) {
  const {
    method = "GET",
    auth = true,
    headers = {},
    body,
    cache,
  } = options;

  const requestHeaders = { Accept: "application/json", ...headers };
  const finalOptions = { method, headers: requestHeaders };

  if (auth) {
    const token = getAccessToken();
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
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

  const url = toUrl(path);

  // Handle caching for GET requests when cache option provided
  if ((method || "GET").toUpperCase() === "GET" && cache) {
    try {
      const key = makeCacheKey(url, options);
      const cached = readCache(key);
      if (cached !== null) {
        return cached;
      }
    } catch (e) {
      // ignore cache read errors
    }
  }

  const response = await fetch(url, finalOptions);
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

  // If request was successful and cache options provided, write to cache
  if (response.ok && (method || "GET").toUpperCase() === "GET" && cache) {
    try {
      const key = makeCacheKey(url, options);
      const ttlSeconds = (cache && cache.ttlSeconds) || (cache && cache.ttl) || 60;
      const persist = Boolean(cache && cache.persist);
      writeCache(key, data, ttlSeconds, persist);
    } catch (e) {
      // ignore cache write errors
    }
  }

  return data;
}

export function unwrapPayload(responseData) {
  if (!responseData || typeof responseData !== "object") return responseData;
  if ("data" in responseData) return responseData.data;
  if ("result" in responseData) return responseData.result;
  return responseData;
}

// Simple caching layer for GET requests. Use via apiRequest(path, { cache: { ttlSeconds: 60, persist: false } })
const _inMemoryCache = new Map();

function makeCacheKey(url, options) {
  // Use the full resolved URL as cache key; include auth flag to avoid leaking role-specific responses
  const authFlag = options && options.auth ? "auth" : "noauth";
  return `api_cache::${url}::${authFlag}`;
}

function readCache(key) {
  // Try in-memory first
  const entry = _inMemoryCache.get(key);
  if (entry && entry.expiresAt > Date.now()) return entry.data;

  // Try persistent storage
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.expiresAt > Date.now()) {
        // populate in-memory for faster access next time
        _inMemoryCache.set(key, { data: parsed.data, expiresAt: parsed.expiresAt });
        return parsed.data;
      }
    }
  } catch (e) {
    // ignore storage errors
  }

  return null;
}

function writeCache(key, data, ttlSeconds = 60, persist = false) {
  const expiresAt = Date.now() + Math.max(1, Number(ttlSeconds) || 60) * 1000;
  _inMemoryCache.set(key, { data, expiresAt });
  if (persist) {
    try {
      localStorage.setItem(key, JSON.stringify({ data, expiresAt }));
    } catch (e) {
      // ignore quota errors
    }
  }
}
