import { apiRequest, getActiveAuthRole } from "./api-client";

function buildFormData(payload = {}) {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(key, String(item)));
      return;
    }
    formData.append(key, value instanceof Blob ? value : String(value));
  });
  return formData;
}
export const tourismApi = {
  // Trips
  getTrips: () => apiRequest("/api/trips", { cache: true, cacheTTL: 5 * 60 * 1000 }),
  createTrip: (payload) =>
    apiRequest("/api/trips", { method: "POST", body: buildFormData(payload) }),
  getTripById: (id) => apiRequest(`/api/trips/${id}`),
  deleteTrip: (id) => apiRequest(`/api/trips/${id}`, { method: "DELETE" }),
  createCustomTrip: (payload) =>
    apiRequest("/api/trips/custom", { method: "POST", body: buildFormData(payload) }),
  getMyCustomTrips: () => apiRequest("/api/trips/custom/my"),
  getCustomTripById: (id) => apiRequest(`/api/trips/custom/${id}`),
  deleteCustomTrip: (id) => apiRequest(`/api/trips/custom/${id}`, { method: "DELETE" }),
  getAllCustomTrips: () => apiRequest("/api/trips/custom/all"),

  // Places
  getPlaces: () => apiRequest("/api/places", { cache: true, cacheTTL: 5 * 60 * 1000 }),
  createPlace: (payload) => apiRequest("/api/places", { method: "POST", body: payload }),
  getPlaceById: (id) => apiRequest(`/api/places/${id}`, { cache: true, cacheTTL: 5 * 60 * 1000 }),
  updatePlace: (id, payload) => apiRequest(`/api/places/${id}`, { method: "PUT", body: payload }),
  deletePlace: (id) => apiRequest(`/api/places/${id}`, { method: "DELETE" }),

  // Favorites
  getFavorites: () => apiRequest("/api/favorites"),
  addFavorite: (placeId) =>
    apiRequest(`/api/favorites/${placeId}`, { method: "POST" }),
  removeFavorite: (placeId) =>
    apiRequest(`/api/favorites/${placeId}`, { method: "DELETE" }),
  importPlaces: () => apiRequest("/api/import/places", { method: "POST" }),

  // Nationalities
  createNationality: (payload) =>
    apiRequest("/api/nationalities", { method: "POST", body: payload }),
  updateNationality: (id, payload) =>
    apiRequest(`/api/nationalities/${id}`, { method: "PUT", body: payload }),
  deleteNationality: (id) => apiRequest(`/api/nationalities/${id}`, { method: "DELETE" }),

  // Guide requests
  createGuideRequest: (payload) =>
    apiRequest("/api/requests", { method: "POST", body: payload }),
  getGuideRequests: () => apiRequest("/api/requests/incoming"),
  getTouristRequests: () => apiRequest("/api/requests/my-requests"),
  getGuideRequestById: (id) => apiRequest(`/api/requests/${id}`),
  acceptGuideRequest: (id) =>
    apiRequest(`/api/requests/${id}/accept`, { method: "POST" }),
  rejectGuideRequest: (id) =>
    apiRequest(`/api/requests/${id}/reject`, { method: "POST" }),
  cancelGuideRequest: (id) =>
    apiRequest(`/api/requests/${id}/cancel`, { method: "POST" }),

  // Chat
  createConversation: (payload) =>
    apiRequest("/api/conversations", { method: "POST", body: payload }),
  getConversations: () => apiRequest("/api/conversations"),
  getConversationById: (id) => apiRequest(`/api/conversations/${id}`),
  getMessages: (conversationId) => apiRequest(`/api/messages/${conversationId}`),
  sendMessage: (payload) => apiRequest("/api/messages", { method: "POST", body: payload }),
  markMessagesRead: (conversationId) => apiRequest(`/api/messages/${conversationId}/read`, { method: "PUT" }),

  // Users
  getUsers: () => apiRequest("/api/users", { cache: true, cacheTTL: 5 * 60 * 1000 }),
  getGuides: () => apiRequest("/api/users/guides", { cache: true, cacheTTL: 5 * 60 * 1000 }),
  getAllGuides: () => apiRequest("/api/users/guides/all"),
  getPendingGuides: () => apiRequest("/api/users/guides/pending"),
  approveGuide: (id) => apiRequest(`/api/users/guides/${id}/approve`, { method: "PUT" }),
  rejectGuide: (id, payload) => apiRequest(`/api/users/guides/${id}/reject`, { method: "PUT", body: payload }),
  suspendGuide: (id) => apiRequest(`/api/users/guides/${id}/suspend`, { method: "PUT" }),
  getUserById: (id) => apiRequest(`/api/users/${id}`),
  deleteUserById: (id) => apiRequest(`/api/users/${id}`, { method: "DELETE" }),
  getUserRoles: (id) => apiRequest(`/api/users/${id}/roles`),
  assignUserRole: (id, role) => apiRequest(`/api/users/${id}/assign-role`, {
    method: "POST",
    body: { roleName: role },
  }),
  removeUserRole: (id, role) => apiRequest(`/api/users/${id}/remove-role`, {
    method: "DELETE",
    body: { roleName: role },
  }),
  getUserPoints: () => apiRequest("/api/users/points"),

  // Booking + payment
  createBooking: (payload) => apiRequest("/api/bookings", { method: "POST", body: payload }),
  getBookings: () => apiRequest(getActiveAuthRole() === "guide" ? "/api/bookings/guide" : "/api/bookings/my"),
  getAllBookings: () => apiRequest("/api/bookings/all"),
  getBookingById: (id) => apiRequest(`/api/bookings/${id}`),
  cancelBooking: (id, payload) =>
    apiRequest(`/api/bookings/${id}/cancel`, { method: "PUT", body: payload }),
  confirmBooking: (id) => apiRequest(`/api/bookings/${id}/confirm`, { method: "PUT" }),
  payBooking: (payload) => apiRequest("/api/payments/pay", { method: "POST", body: payload }),
  refundBooking: (payload) => apiRequest("/api/payments/refund", { method: "POST", body: payload }),
  getPaymentByBooking: (bookingId) => apiRequest(`/api/payments/booking/${bookingId}`),

  // Notifications
  getNotifications: () => apiRequest("/api/notifications"),
  createNotification: (payload) =>
    apiRequest("/api/notifications", { method: "POST", body: payload }),
  getNotificationById: (id) => apiRequest(`/api/notifications/${id}`),
  markNotificationRead: (id) => apiRequest(`/api/notifications/${id}/read`, { method: "PUT" }),
  markNotificationsReadAll: () => apiRequest("/api/notifications/read-all", { method: "PUT" }),
  deleteNotification: (id) => apiRequest(`/api/notifications/${id}`, { method: "DELETE" }),

  // Roles
  getRoles: () => apiRequest("/api/roles"),
  createRole: (payload) => apiRequest("/api/roles", { method: "POST", body: payload }),
  deleteRole: (id) => apiRequest(`/api/roles/${id}`, { method: "DELETE" }),

  // Reviews
  getPlaceReviews: (placeId) => apiRequest(`/api/reviews/place/${placeId}`),
  createReview: (payload) => apiRequest("/api/reviews", { method: "POST", body: payload }),
  updateReview: (id, payload) => apiRequest(`/api/reviews/${id}`, { method: "PUT", body: payload }),
  deleteReview: (id) => apiRequest(`/api/reviews/${id}`, { method: "DELETE" }),
};
