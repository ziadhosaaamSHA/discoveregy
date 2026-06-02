import { apiRequest } from "../api-client";
import { validateCreateNotificationRequest } from "../contracts";

/**
 * Notification endpoints serve the admin broadcast flow and user read state.
 */
export const notificationsApi = {
  // Loads current user's notifications.
  getNotifications: () => apiRequest("/api/notifications"),
  // Creates an admin notification/broadcast.
  createNotification: (payload) =>
    apiRequest("/api/notifications", { method: "POST", body: validateCreateNotificationRequest(payload) }),
  // Loads one notification by id.
  getNotificationById: (id) => apiRequest(`/api/notifications/${id}`),
  // Marks one notification as read.
  markNotificationRead: (id) => apiRequest(`/api/notifications/${id}/read`, { method: "PUT" }),
  // Marks every notification as read.
  markNotificationsReadAll: () => apiRequest("/api/notifications/read-all", { method: "PUT" }),
  // Deletes one notification.
  deleteNotification: (id) => apiRequest(`/api/notifications/${id}`, { method: "DELETE" }),
};
