import { extractArray } from "../../shared/utils/api-shapes";
import { notificationSchema } from "../../shared/schemas/notification";

export function normalizeNotification(rawNotification) {
  const parsed = notificationSchema.safeParse(rawNotification);
  const notification = parsed.success ? parsed.data : rawNotification;
  const id = Number(notification?.id ?? notification?.notificationId);
  const title = notification?.title || notification?.subject || "Notification";
  const message = notification?.message || notification?.body || notification?.content || "";
  const createdAt = notification?.createdAt || notification?.date || notification?.timestamp || "";
  const isRead =
    typeof notification?.isRead === "boolean"
      ? notification.isRead
      : typeof notification?.read === "boolean"
        ? notification.read
        : String(notification?.status || "").toLowerCase() === "read";

  return {
    id,
    title,
    message,
    createdAt,
    isRead,
  };
}

export function normalizeNotifications(payload) {
  return extractArray(payload)
    .map(normalizeNotification)
    .filter((notification) => Number.isFinite(notification.id));
}

export function isUnreadNotification(notification) {
  return Boolean(notification && !normalizeNotification(notification).isRead);
}
