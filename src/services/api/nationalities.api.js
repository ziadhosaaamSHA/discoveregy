import { apiRequest } from "../api-client";
import { validateCreateNationalityRequest } from "../contracts";

/**
 * Nationality admin endpoints use one shared DTO for create and update.
 * Public signup lookups live in public-nationalities.api.js.
 */
export const nationalitiesApi = {
  // Creates a nationality record.
  createNationality: (payload) =>
    apiRequest("/api/nationalities", { method: "POST", body: validateCreateNationalityRequest(payload) }),
  // Updates a nationality record.
  updateNationality: (id, payload) =>
    apiRequest(`/api/nationalities/${id}`, { method: "PUT", body: validateCreateNationalityRequest(payload) }),
  // Deletes a nationality record.
  deleteNationality: (id) => apiRequest(`/api/nationalities/${id}`, { method: "DELETE" }),
};
