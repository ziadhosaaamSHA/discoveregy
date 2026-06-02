/**
 * Parses JSON without throwing.
 * Empty or invalid JSON responses become null and are handled by the caller.
 */
export function parseJsonSafely(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Reads a fetch Response body exactly once and returns JSON when possible.
 */
export async function parseResponse(response) {
  const text = await response.text();
  const json = parseJsonSafely(text);
  return json ?? text ?? null;
}

/**
 * Unwraps common backend response envelopes while leaving raw responses unchanged.
 */
export function unwrapPayload(responseData) {
  if (!responseData || typeof responseData !== "object") return responseData;
  if ("data" in responseData) return responseData.data;
  if ("result" in responseData) return responseData.result;
  return responseData;
}
