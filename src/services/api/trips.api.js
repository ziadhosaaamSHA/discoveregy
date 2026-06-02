import { apiRequest } from "../api-client";
import { buildFormData } from "../client/form-data";

/**
 * Trip endpoints cover predefined trips and tourist-generated custom plans.
 */
export const tripsApi = {
  // Loads all predefined trips.
  getTrips: () => apiRequest("/api/trips", { cache: true, cacheTTL: 5 * 60 * 1000 }),
  // Creates a predefined trip from multipart admin form data.
  createTrip: (payload) =>
    apiRequest("/api/trips", { method: "POST", body: buildFormData(payload) }),
  // Loads one predefined trip by id.
  getTripById: (id) => apiRequest(`/api/trips/${id}`),
  // Deletes a predefined trip.
  deleteTrip: (id) => apiRequest(`/api/trips/${id}`, { method: "DELETE" }),

  // Creates a custom trip from selected places and timing data.
  createCustomTrip: (payload) =>
    apiRequest("/api/trips/custom", { method: "POST", body: buildFormData(payload) }),
  // Loads custom trips for the current tourist.
  getMyCustomTrips: () => apiRequest("/api/trips/custom/my"),
  // Loads one custom trip by id.
  getCustomTripById: (id) => apiRequest(`/api/trips/custom/${id}`),
  // Deletes a custom trip.
  deleteCustomTrip: (id) => apiRequest(`/api/trips/custom/${id}`, { method: "DELETE" }),
  // Admin-only list of every custom trip.
  getAllCustomTrips: () => apiRequest("/api/trips/custom/all"),
};
