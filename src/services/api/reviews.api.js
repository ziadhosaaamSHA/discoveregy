import { apiRequest } from "../api-client";
import { validateCreatePlaceReviewRequest, validateUpdatePlaceReviewRequest } from "../contracts";

/**
 * Review endpoints currently target places.
 * Guide-review endpoints should get their own sibling file when used by the UI.
 */
export const reviewsApi = {
  // Loads reviews for one place.
  getPlaceReviews: (placeId) => apiRequest(`/api/reviews/place/${placeId}`),
  // Creates a review for a place.
  createReview: (payload) =>
    apiRequest("/api/reviews", { method: "POST", body: validateCreatePlaceReviewRequest(payload) }),
  // Updates an existing place review.
  updateReview: (id, payload) =>
    apiRequest(`/api/reviews/${id}`, { method: "PUT", body: validateUpdatePlaceReviewRequest(payload) }),
  // Deletes one review.
  deleteReview: (id) => apiRequest(`/api/reviews/${id}`, { method: "DELETE" }),
};
