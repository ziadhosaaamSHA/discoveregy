import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Bell, Eye, Trash2 } from "lucide-react";
import { useLanguage } from "../../../../context/LanguageContext";
import { tourismApi } from "../../../../services/tourism-api";

function extractArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function normalizeNotification(raw) {
  const id = Number(raw?.id ?? raw?.notificationId);
  const title = raw?.title || raw?.subject || "Notification";
  const message = raw?.message || raw?.body || raw?.content || "";
  const createdAt = raw?.createdAt || raw?.date || raw?.timestamp || "";
  const isRead =
    typeof raw?.isRead === "boolean"
      ? raw.isRead
      : typeof raw?.read === "boolean"
        ? raw.read
        : String(raw?.status || "").toLowerCase() === "read";

  return {
    id,
    title,
    message,
    createdAt,
    isRead,
  };
}

// Notifications lists guide/tourist activity updates and local read/delete state.
export default function Notifications() {
  const { t, isRTL } = useLanguage();
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => Number(a.isRead) - Number(b.isRead)),
    [items]
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setError("");
        setIsLoading(true);
        const response = await tourismApi.getNotifications();
        const mapped = extractArray(response).map(normalizeNotification).filter((n) => Number.isFinite(n.id));
        if (!cancelled) setItems(mapped);
      } catch (err) {
        if (!cancelled) setError(err?.message || t("notifications.loadFailed"));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const handleOpen = async (notification) => {
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
      setError(err?.message || t("notifications.loadFailed"));
    }
  };

  const handleDelete = async (id) => {
    try {
      await tourismApi.deleteNotification(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      setSelected((prev) => (prev?.id === id ? null : prev));
    } catch (err) {
      setError(err?.message || t("notifications.deleteFailed"));
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await tourismApi.markNotificationsReadAll();
      setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
    } catch (err) {
      setError(err?.message || "Could not mark all notifications as read.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F2E0CA]">
      <main className="pt-28 pb-16 px-6" dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-[1100px] mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-black text-[#154d7d] mb-0">{t("notifications.title")}</h1>
            {items.some((item) => !item.isRead) && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="px-5 py-2.5 bg-[#154d7d] text-white text-sm font-bold rounded-xl hover:bg-[#0f3c61] transition-all shadow-sm active:scale-95"
              >
                {t("notifications.markAllRead") || "Mark All Read"}
              </button>
            )}
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="bg-white rounded-2xl p-4 shadow-sm min-h-[420px]">
              {isLoading ? (
                <p className="text-gray-500 px-2 py-3">{t("common.loading")}</p>
              ) : sortedItems.length === 0 ? (
                <p className="text-gray-500 px-2 py-3">{t("notifications.empty")}</p>
              ) : (
                <div className="space-y-2">
                  {sortedItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleOpen(item)}
                      className={`w-full text-left rounded-xl px-4 py-3 border transition ${
                        item.isRead ? "bg-gray-50 border-gray-200" : "bg-[#fff3e0] border-[#f0d7b0]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-bold text-[#154d7d] truncate">{item.title}</p>
                          <p className="text-sm text-gray-600 line-clamp-2">{item.message || "-"}</p>
                        </div>
                        {!item.isRead && <span className="w-2 h-2 rounded-full bg-[#d43e0b] mt-2 shrink-0" />}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-white rounded-2xl p-6 shadow-sm min-h-[420px]">
              {selected ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-black text-[#154d7d]">{selected.title}</h2>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpen(selected)}
                        className="w-10 h-10 rounded-full bg-[#f2e0ca] flex items-center justify-center hover:bg-[#ead3b6]"
                        aria-label={t("notifications.refresh")}
                        title={t("notifications.refresh")}
                      >
                        <Eye size={18} className="text-[#154d7d]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(selected.id)}
                        className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-700"
                        aria-label={t("notifications.delete")}
                        title={t("notifications.delete")}
                      >
                        <Trash2 size={18} className="text-white" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">{selected.createdAt || "-"}</p>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.message || "-"}</p>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <Bell size={42} className="mb-2 text-gray-400" />
                  <p>{t("notifications.selectOne")}</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
