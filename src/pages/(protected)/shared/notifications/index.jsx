import { motion } from "framer-motion";
import { Bell, Eye, Trash2 } from "lucide-react";
import { useLanguage } from "../../../../context/LanguageContext";
import { Button, IconButton } from "../../../../components/ui";
import { useNotifications } from "./hooks/useNotifications";

// Notifications lists guide/tourist activity updates and local read/delete state.
export default function Notifications() {
  const { t, isRTL } = useLanguage();
  const {
    sortedItems,
    selected,
    error,
    isLoading,
    hasUnread,
    openNotification,
    deleteNotification,
    markAllRead,
  } = useNotifications();

  return (
    <div className="min-h-screen bg-[#F2E0CA]">
      <main className="pt-28 pb-16 px-6" dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-[1100px] mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-black text-[#154d7d] mb-0">{t("notifications.title")}</h1>
            {hasUnread && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={markAllRead}
              >
                {t("notifications.markAllRead")}
              </Button>
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
                      onClick={() => openNotification(item)}
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
                      <IconButton
                        label={t("notifications.refresh")}
                        onClick={() => openNotification(selected)}
                        className="w-10 h-10 rounded-full bg-[#f2e0ca] flex items-center justify-center hover:bg-[#ead3b6]"
                      >
                        <Eye size={18} className="text-[#154d7d]" />
                      </IconButton>
                      <IconButton
                        label={t("notifications.delete")}
                        onClick={() => deleteNotification(selected.id)}
                        className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-700"
                      >
                        <Trash2 size={18} className="text-white" />
                      </IconButton>
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
