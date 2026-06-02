import { useCallback, useEffect, useMemo, useState } from "react";
import { tourismApi } from "../../../../../services/tourism-api";
import {
  normalizeNotification,
  normalizeNotifications,
} from "../../../../../services/mappers/notification.mapper";

// Owns notification loading, read state, deletion, and sorting for the page.
export function useNotifications() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => Number(a.isRead) - Number(b.isRead)),
    [items]
  );

  const hasUnread = useMemo(() => items.some((item) => !item.isRead), [items]);

  useEffect(() => {
    const controller = new AbortController();

    const loadNotifications = async () => {
      try {
        const response = await tourismApi.getNotifications();
        if (controller.signal.aborted) return;
        setError("");
        setItems(normalizeNotifications(response));
      } catch (err) {
        if (!controller.signal.aborted) setError(err?.message || "Could not load notifications.");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    loadNotifications();
    return () => controller.abort();
  }, []);

  const openNotification = useCallback(async (notification) => {
    try {
      const details = await tourismApi.getNotificationById(notification.id);
      const payload = typeof details === "object" && details ? details : notification;
      const next = normalizeNotification(payload);
      setSelected(next);
      await tourismApi.markNotificationRead(notification.id);
      setItems((prev) =>
        prev.map((item) => (item.id === notification.id ? { ...item, isRead: true } : item))
      );
    } catch (err) {
      setError(err?.message || "Could not load notifications.");
    }
  }, []);

  const deleteNotification = useCallback(async (id) => {
    try {
      await tourismApi.deleteNotification(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      setSelected((prev) => (prev?.id === id ? null : prev));
    } catch (err) {
      setError(err?.message || "Could not delete notification.");
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await tourismApi.markNotificationsReadAll();
      setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
    } catch (err) {
      setError(err?.message || "Could not mark all notifications as read.");
    }
  }, []);

  return {
    sortedItems,
    selected,
    error,
    isLoading,
    hasUnread,
    openNotification,
    deleteNotification,
    markAllRead,
  };
}
