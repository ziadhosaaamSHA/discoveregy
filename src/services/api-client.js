import {
  clearAuthTokens,
  getAccessToken,
  getActiveAuthRole,
  getRefreshToken,
  isApiCacheEnabled,
  parseResponse,
  readApiCache,
  readTokensFromPayload,
  setApiCache,
  setAuthTokens,
  toUrl,
} from "./client";

// Compatibility surface:
// Many pages still import token helpers and asset URL helpers from api-client.js.
// Keep these exports stable even though their implementations now live in src/services/client.
export {
  clearApiCache,
  clearAuthTokens,
  getAccessToken,
  getActiveAuthRole,
  getRefreshToken,
  resolveApiAssetUrl,
  setActiveAuthRole,
  setApiCache,
  setAuthTokens,
  unwrapPayload,
} from "./client";

let refreshPromise = null;

/**
 * Standard error thrown by every service request.
 * UI code can inspect `status` and `data` when it needs backend-specific messaging.
 */
export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Refreshes the active role's access token.
 *
 * `refreshPromise` prevents multiple simultaneous 401 responses from sending
 * duplicate refresh requests. Every waiting request shares the same refresh result.
 */
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

/**
 * Builds the browser `fetch` options for one API request.
 *
 * This is the only place that decides:
 * - whether to add the Bearer token,
 * - whether a payload should be JSON or FormData,
 * - which default headers every request should include.
 */
function buildRequestOptions({ method, headers, body, auth }) {
  const requestHeaders = { Accept: "application/json", ...headers };
  const finalOptions = { method, headers: requestHeaders };

  if (auth) {
    const token = getAccessToken();
    if (token) requestHeaders.Authorization = `Bearer ${token}`;
  }

  if (body === undefined) return finalOptions;
  if (body instanceof FormData) {
    finalOptions.body = body;
    return finalOptions;
  }

  requestHeaders["Content-Type"] = requestHeaders["Content-Type"] || "application/json";
  finalOptions.body = typeof body === "string" ? body : JSON.stringify(body);
  return finalOptions;
}

/**
 * Reads the most useful backend error field while preserving a fallback message.
 * Backends often vary between `message`, `title`, `error`, and `detail`.
 */
function getErrorMessage(data, status) {
  return (
    (data && typeof data === "object" && (data.message || data.title || data.error || data.detail)) ||
    `Request failed (${status})`
  );
}

/**
 * Internal transport pipeline used by all domain API files.
 *
 * It handles cache reads before the network, parses the response body once,
 * refreshes an expired token once, and converts failed responses into ApiError.
 */
async function apiRequestInternal(path, options = {}, retry = true) {
  const {
    method = "GET",
    auth = true,
    headers = {},
    body,
  } = options;

  const cachedData = readApiCache(path, { method, body, cache: options.cache });
  if (cachedData !== undefined) return cachedData;

  const response = await fetch(toUrl(path), buildRequestOptions({ method, headers, body, auth }));
  const data = await parseResponse(response);

  if (!response.ok) {
    if (response.status === 401 && auth && retry && getRefreshToken()) {
      try {
        await refreshAccessToken();
      } catch {
        clearAuthTokens();
        throw new ApiError("Session expired. Please login again.", 401, data);
      }
      return apiRequestInternal(path, options, false);
    }

    throw new ApiError(getErrorMessage(data, response.status), response.status, data);
  }

  return data;
}

/**
 * Public request wrapper used by service modules.
 *
 * Successful opt-in GET requests are saved to the shared in-memory cache.
 * Mutating requests are never cached because cache writes are gated by method.
 */
export async function apiRequestWithCache(path, options = {}, retry = true) {
  const response = await apiRequestInternal(path, options, retry);
  const method = (options.method || "GET").toUpperCase();
  if (isApiCacheEnabled() && options.cache && method === "GET") {
    const ttl = typeof options.cacheTTL === "number" ? options.cacheTTL : 5 * 60 * 1000;
    setApiCache(path, options, response, ttl);
  }
  return response;
}

// `apiRequest` is the name used throughout the app; keep it as the public alias.
export { apiRequestWithCache as apiRequest };
