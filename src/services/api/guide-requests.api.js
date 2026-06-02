import { apiRequest } from "../api-client";
import { validateCreateGuideRequest } from "../contracts";

/**
 * Guide requests connect tourists, guides, and trips before a guided experience.
 */
export const guideRequestsApi = {
  // Creates a request from tourist to guide for a trip.
  createGuideRequest: (payload) =>
    apiRequest("/api/requests", { method: "POST", body: validateCreateGuideRequest(payload) }),
  // Loads requests assigned to the current guide.
  getGuideRequests: () => apiRequest("/api/requests/incoming"),
  // Loads requests created by the current tourist.
  getTouristRequests: () => apiRequest("/api/requests/my-requests"),
  // Loads one guide request by id.
  getGuideRequestById: (id) => apiRequest(`/api/requests/${id}`),
  // Guide accepts an incoming request.
  acceptGuideRequest: (id) => apiRequest(`/api/requests/${id}/accept`, { method: "POST" }),
  // Guide rejects an incoming request.
  rejectGuideRequest: (id) => apiRequest(`/api/requests/${id}/reject`, { method: "POST" }),
  // Tourist cancels their created request.
  cancelGuideRequest: (id) => apiRequest(`/api/requests/${id}/cancel`, { method: "POST" }),
};
