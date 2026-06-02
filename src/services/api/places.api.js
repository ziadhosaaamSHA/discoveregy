import { apiRequest } from "../api-client";

/**
 * Place endpoints are intentionally thin because create/update can send FormData.
 * UI-facing place normalization belongs in mappers/place.mapper.js.
 */
export const placesApi = {
  // Loads public/admin place list.
  getPlaces: () => apiRequest("/api/places", { cache: true, cacheTTL: 5 * 60 * 1000 }),
  // Creates a place; admin forms may pass FormData directly.
  createPlace: (payload) => apiRequest("/api/places", { method: "POST", body: payload }),
  // Loads one place by id.
  getPlaceById: (id) => apiRequest(`/api/places/${id}`, { cache: true, cacheTTL: 5 * 60 * 1000 }),
  // Updates a place; admin forms may pass FormData directly.
  updatePlace: (id, payload) => apiRequest(`/api/places/${id}`, { method: "PUT", body: payload }),
  // Deletes a place.
  deletePlace: (id) => apiRequest(`/api/places/${id}`, { method: "DELETE" }),
  // Triggers backend place import.
  importPlaces: () => apiRequest("/api/import/places", { method: "POST" }),
};
