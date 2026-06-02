import { apiRequest } from "../api-client";
import { extractArrayPayload, extractPayload } from "../contracts";

/**
 * Public nationality endpoints support signup and admin forms.
 * They are auth:false because signup needs nationalities before a user has tokens.
 */

/**
 * Loads the public nationality list.
 */
export async function fetchNationalities() {
  const data = await apiRequest("/api/nationalities", { method: "GET", auth: false });
  return extractArrayPayload(data);
}

/**
 * Loads one nationality by id to verify a selected numeric value exists.
 */
export async function fetchNationalityById(id) {
  const data = await apiRequest(`/api/nationalities/${id}`, { method: "GET", auth: false });
  const payload = extractPayload(data);
  if (!payload || typeof payload !== "object") {
    throw new Error("Failed to load nationality details.");
  }
  return payload;
}

/**
 * Resolves either a numeric nationality id or a display name into a backend id.
 */
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
