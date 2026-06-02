import { tourismApi } from "./tourism-api";
import { extractArrayPayload } from "./contracts";
import { mapApiPlaces } from "./mappers/place.mapper";

let destinationsCache = null;
let inflightRequest = null;

/**
 * Loads public destination cards from the places API.
 *
 * This function owns request-level caching and in-flight deduplication only.
 * Backend-to-UI place mapping belongs in mappers/place.mapper.js.
 */
export async function fetchDestinations(options = {}) {
  const { force = false } = options;

  if (!force && destinationsCache) return destinationsCache;
  if (!force && inflightRequest) return inflightRequest;

  inflightRequest = (async () => {
    const response = await tourismApi.getPlaces();
    const apiPlaces = extractArrayPayload(response);
    const merged = mapApiPlaces(apiPlaces);
    destinationsCache = merged;
    return merged;
  })();

  try {
    return await inflightRequest;
  } finally {
    inflightRequest = null;
  }
}

/**
 * Reserved fallback hook for offline/static destinations.
 * Kept empty so the app does not silently show mock data when real API data is unavailable.
 */
export function getFallbackDestinations() {
  return [];
}
