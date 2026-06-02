import { toUrl } from "./url";

/**
 * Returns the shared in-memory cache map, creating it lazily.
 * Cache is deliberately process-local and resets on page refresh.
 */
function getCacheMap() {
  if (!globalThis.__degyApiCache) globalThis.__degyApiCache = new Map();
  return globalThis.__degyApiCache;
}

/**
 * Feature flag gate for API caching.
 * Caching is off unless VITE_ENABLE_API_CACHE is explicitly true.
 */
export function isApiCacheEnabled() {
  return import.meta.env.VITE_ENABLE_API_CACHE === "true";
}

/**
 * Builds a stable cache key from request method, URL, and body.
 * GET requests normally have no body, but including it makes the helper safe for future use.
 */
export function makeCacheKey(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  let body = "";
  try {
    if (options.body && typeof options.body === "string") body = options.body;
    else if (options.body && typeof options.body === "object") body = JSON.stringify(options.body);
  } catch {
    body = String(options.body || "");
  }
  return `${method}::${toUrl(path)}::${body}`;
}

/**
 * Reads cached GET data when caching is enabled and the caller opted in.
 * Returns undefined instead of null so endpoints can legitimately cache null responses.
 */
export function readApiCache(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  if (!isApiCacheEnabled() || !options.cache || method !== "GET") return undefined;

  const entry = getCacheMap().get(makeCacheKey(path, options));
  if (!entry || entry.expiresAt <= Date.now()) return undefined;
  return entry.data;
}

/**
 * Stores a successful response in the API cache for a limited time.
 */
export function setApiCache(path, options, data, ttl = 5 * 60 * 1000) {
  getCacheMap().set(makeCacheKey(path, options), { expiresAt: Date.now() + ttl, data });
}

/**
 * Clears all cached responses, or just keys with a matching prefix.
 */
export function clearApiCache(keyPrefix) {
  const cacheMap = getCacheMap();
  if (!keyPrefix) {
    cacheMap.clear();
    return;
  }
  for (const key of Array.from(cacheMap.keys())) {
    if (key.startsWith(keyPrefix)) cacheMap.delete(key);
  }
}
