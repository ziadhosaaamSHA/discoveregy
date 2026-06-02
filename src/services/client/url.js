const DEFAULT_API_BASE_URL =
  "https://tourism-api-sha-e7g5guagcdc2dddv.westeurope-01.azurewebsites.net";

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "" : DEFAULT_API_BASE_URL)
).replace(/\/+$/, "");

const API_ASSET_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/+$/, "");

/**
 * Builds a backend API URL from a relative path.
 * Absolute URLs pass through for exceptional external calls.
 */
export function toUrl(path) {
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Converts backend asset paths into browser-ready image/video URLs.
 */
export function resolveApiAssetUrl(path) {
  if (typeof path !== "string") return "";
  const trimmed = path.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http")) return trimmed;
  return `${API_ASSET_BASE_URL}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
}
