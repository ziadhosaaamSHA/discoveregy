import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MessageSquare,
  Trash2,
  User,
  Wallet,
  Compass,
  ChevronLeft,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import { useLanguage } from "../../../../context/LanguageContext";
import * as myTripsBackend from "./backend/myTripsBackend";
import { resolveApiAssetUrl } from "../../../../services/api-client";
import { formatAmount } from "../../../../shared/utils/money";
import {
  ConfirmModal,
  LoadingState,
  EmptyState,
  Button,
} from "../../../../components/ui";

const INACTIVE_TRIP_STATUSES = new Set(["cancelled", "canceled", "rejected"]);

function isInactiveTrip(trip) {
  return INACTIVE_TRIP_STATUSES.has(String(trip?.status || "").toLowerCase());
}

export default function MyTrips() {
  const navigate = useNavigate();
  const { isRTL, language, t } = useLanguage();

  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // "all" | "predefined" | "custom" | "cancelled"

  // Cancellation States
  const [tripToCancel, setTripToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancellationError, setCancellationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await myTripsBackend.loadMyTrips();
        if (!cancelled) {
          setTrips(data.bookings);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Failed to load bookings.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleMessageGuide = async (trip) => {
    if (!trip.guideId) return;

    if (trip.conversationId) {
      navigate(`/chats/${trip.conversationId}`);
      return;
    }

    try {
      const cid = await myTripsBackend.getOrCreateConversation(trip.guideId);
      if (cid) {
        navigate(`/chats/${cid}`);
      } else {
        navigate("/chats");
      }
    } catch {
      navigate("/chats");
    }
  };

  const handleCancelClick = (event, trip) => {
    event.stopPropagation();
    setTripToCancel(trip);
    setCancellationError("");
    setSuccessMessage("");
  };

  const confirmCancellation = async () => {
    if (!tripToCancel || isCancelling) return;
    setIsCancelling(true);
    setCancellationError("");

    try {
      await myTripsBackend.cancelTripBooking(
        tripToCancel.id,
        tripToCancel.amount,
        tripToCancel.paymentMethod
      );

      // Reflect change in local state
      setTrips((prev) =>
        prev.map((t) => (t.id === tripToCancel.id ? { ...t, status: "cancelled" } : t))
      );

      setSuccessMessage(
        language === "ar"
          ? "تم إلغاء الرحلة بنجاح واسترداد المبلغ."
          : "Trip booking cancelled and refunded successfully."
      );
      setTripToCancel(null);
    } catch (err) {
      setCancellationError(err?.message || "Failed to cancel booking. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  const filteredTrips = useMemo(() => {
    if (activeTab === "cancelled") {
      return trips.filter(isInactiveTrip);
    }

    const activeTrips = trips.filter((trip) => !isInactiveTrip(trip));
    if (activeTab === "all") return activeTrips;
    return activeTrips.filter((trip) => trip.planType === activeTab);
  }, [trips, activeTab]);

  const tripTabs = [
    { id: "all", label: t("myTrips.tabs.all") || (language === "ar" ? "الرحلات النشطة" : "All Active") },
    { id: "predefined", label: t("myTrips.tabs.predefined") || (language === "ar" ? "رحلات جاهزة" : "Ready Trips") },
    { id: "custom", label: t("myTrips.tabs.custom") || (language === "ar" ? "خطط مخصصة" : "Custom Plans") },
    { id: "cancelled", label: t("myTrips.tabs.cancelled") || (language === "ar" ? "الملغية / المرفوضة" : "Cancelled / Rejected") },
  ];

  return (
    <div className="min-h-screen bg-[#ead9c5] pt-26 px-4 py-8 text-black font-sans pb-32" dir={isRTL ? "rtl" : "ltr"}>
      {/* Page Header */}
      <header className="max-w-6xl mx-auto px-2 mb-10 flex flex-col sm:flex-row items-center justify-between gap-6 pt-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="hover:opacity-75 transition-opacity" aria-label="Go Back">
            {isRTL ? <ChevronLeft size={28} className="rotate-180" /> : <ChevronLeft size={28} />}
          </button>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight">
            {t("myTrips.title") || (language === "ar" ? "رحلاتي المحجوزة" : "My Booked Trips")}
          </h1>
        </div>

        {/* Filters/Tabs */}
        <div className="flex flex-wrap justify-center p-1 bg-black/5 rounded-full border border-black/5 self-center sm:self-auto">
          {tripTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-black transition-all duration-300 ${
                activeTab === tab.id ? "bg-[#e67e22] text-white shadow-md" : "text-gray-700 hover:bg-black/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-2">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <LoadingState key="loading" className="py-24">
              {t("common.loading") || (language === "ar" ? "جاري تحميل رحلاتك..." : "Loading your trips...")}
            </LoadingState>
          ) : error ? (
            <div key="error" className="py-14 text-center bg-red-50 rounded-[40px] border-2 border-red-200">
              <p className="text-red-700 font-bold italic">{error}</p>
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="flex flex-col gap-6 items-center">
              <EmptyState key="empty" tone="muted" className="py-24 max-w-2xl w-full">
                {language === "ar"
                  ? "لا يوجد رحلات مطابقة في حسابك حالياً."
                  : "No bookings found matching this category."}
              </EmptyState>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button onClick={() => navigate("/tourist/plans")} variant="primary">
                  {language === "ar" ? "تصفح الرحلات الجاهزة" : "Browse Ready Trips"}
                </Button>
                <Button onClick={() => navigate("/tourist/create-plan")} variant="secondary">
                  {language === "ar" ? "إنشاء خطة مخصصة" : "Create Custom Plan"}
                </Button>
              </div>
            </div>
          ) : (
            <motion.div
              key="list"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.15 } },
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {filteredTrips.map((trip) => {
                const isCancelled = isInactiveTrip(trip);
                const isPaid = trip.status === "paid" || trip.status === "confirmed";

                return (
                  <motion.div
                    key={trip.id}
                    variants={{
                      hidden: { opacity: 0, y: 30 },
                      visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 20 } },
                    }}
                    className={`bg-white/80 backdrop-blur-md border border-[#8a4b10]/15 rounded-[36px] shadow-xl p-6 relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl ${
                      isCancelled ? "opacity-75 border-gray-200" : ""
                    }`}
                  >
                    {/* Header tags */}
                    <div className="flex items-center justify-between mb-4">
                      {/* Plan Type Badge */}
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        trip.planType === "custom"
                          ? "bg-[#fff3e0] text-[#b97407] border border-[#ffb74d]/30"
                          : "bg-[#e8f5e9] text-[#2e7d32] border border-[#81c784]/30"
                      }`}>
                        {trip.planType === "custom"
                          ? (language === "ar" ? "خطة مخصصة" : "AI Custom Plan")
                          : (language === "ar" ? "رحلة جاهزة" : "Ready package")}
                      </span>

                      {/* Booking Status Badge */}
                      <span
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isCancelled
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : isPaid
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {trip.status === "pending"
                          ? (language === "ar" ? "قيد الانتظار" : "Pending")
                          : trip.status === "confirmed"
                          ? (language === "ar" ? "مؤكد" : "Confirmed")
                          : trip.status === "paid"
                          ? (language === "ar" ? "مدفوع" : "Paid")
                          : trip.status === "cancelled" || trip.status === "rejected"
                          ? (language === "ar" ? "ملغي" : "Cancelled")
                          : trip.status}
                      </span>
                    </div>

                    {/* Content Body */}
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-gray-800 tracking-tight mb-2">
                        {trip.title[language] || trip.title.en}
                      </h3>

                      {trip.description?.[language] && (
                        <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3">
                          {trip.description[language] || trip.description.en}
                        </p>
                      )}

                      {/* Timing & Amount Grid */}
                      <div className="grid grid-cols-2 gap-4 bg-[#fbf5ee] p-4 rounded-2xl border border-[#8a4b10]/5 mb-6">
                        <div className="flex items-center gap-2.5">
                          <Calendar size={18} className="text-[#e67e22] flex-shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              {t("createPlan.dateLabel") || "Date"}
                            </span>
                            <span className="text-sm font-bold text-gray-800 truncate">
                              {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : ""}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <Wallet size={18} className="text-[#e67e22] flex-shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              {language === "ar" ? "المبلغ المدفوع" : "Amount Paid"}
                            </span>
                            <span className="text-sm font-black text-[#e67e22] truncate">
                              {trip.amount ? formatAmount(trip.amount, language) : (language === "ar" ? "مجاني" : "Free")}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Stops & Places Previews */}
                      {trip.stops && trip.stops.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-xs font-black text-[#e67e22] uppercase tracking-widest mb-3 flex items-center gap-1">
                            <Compass size={14} />
                            <span>{language === "ar" ? "محطات الزيارة" : "Visited Stops"} ({trip.stops.length})</span>
                          </h4>
                          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#c59d75]">
                            {trip.stops.map((stop) => (
                              <div
                                key={stop.id}
                                className="flex-shrink-0 w-24 bg-white border border-[#8a4b10]/10 rounded-2xl overflow-hidden shadow-sm flex flex-col"
                              >
                                <div className="h-16 w-full overflow-hidden bg-[#c9ae89]">
                                  {stop.image ? (
                                    <img
                                      src={resolveApiAssetUrl(stop.image)}
                                      alt="stop"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-[#c9ae89]" />
                                  )}
                                </div>
                                <div className="p-2 min-w-0 flex-1 flex flex-col justify-center">
                                  <span className="text-[10px] font-bold text-gray-800 truncate block">
                                    {stop.copy?.[language]?.name || stop.copy?.en?.name}
                                  </span>
                                  <span className="text-[8px] font-bold text-[#e67e22] uppercase truncate block">
                                    {stop.copy?.[language]?.location || stop.copy?.en?.location}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Custom Stops String Fallback */}
                      {trip.stops.length === 0 && trip.customStopString && (
                        <div className="mb-6">
                          <h4 className="text-xs font-black text-[#e67e22] uppercase tracking-widest mb-2 flex items-center gap-1">
                            <Compass size={14} />
                            <span>{language === "ar" ? "مسار الرحلة المخصص" : "Custom Itinerary stops"}</span>
                          </h4>
                          <p className="text-xs font-bold text-gray-600 bg-[#fbf5ee] p-3 rounded-xl border border-dashed border-[#8a4b10]/20">
                            {trip.customStopString}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions (Guide profile & Booking Cancellation) */}
                    <div className="mt-4 pt-4 border-t border-[#8a4b10]/10 flex flex-col sm:flex-row items-center gap-4 justify-between">
                      {/* Tour Guide mini card */}
                      {trip.guideName ? (
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 border-2 border-white shadow-md flex-shrink-0 flex items-center justify-center">
                            {trip.guideImage ? (
                              <img src={trip.guideImage} alt={trip.guideName} className="w-full h-full object-cover" />
                            ) : (
                              <User size={20} className="text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider leading-none mb-1">
                              {language === "ar" ? "المرشد السياحي" : "Assigned Guide"}
                            </p>
                            <p className="font-bold text-sm text-gray-800 truncate">{trip.guideName}</p>
                          </div>
                          {!isCancelled && (
                            <button
                              type="button"
                              onClick={() => handleMessageGuide(trip)}
                              className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all ml-auto sm:ml-0"
                              title={language === "ar" ? "مراسلة المرشد" : "Message Tour Guide"}
                              aria-label="Message guide"
                            >
                              <MessageSquare size={16} />
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-400 text-xs font-bold italic py-2">
                          <HelpCircle size={16} />
                          <span>{language === "ar" ? "لم يتم تعيين مرشد" : "No guide assigned"}</span>
                        </div>
                      )}

                      {/* Cancel Booking Action */}
                      {!isCancelled && (
                        <button
                          type="button"
                          onClick={(event) => handleCancelClick(event, trip)}
                          className="w-full sm:w-auto px-4 py-2 border border-red-200 text-red-600 rounded-xl font-bold text-xs hover:bg-red-50 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                        >
                          <Trash2 size={14} />
                          <span>{language === "ar" ? "إلغاء الحجز" : "Cancel Trip"}</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Success Notification Banner */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-6 right-6 z-50 max-w-md mx-auto bg-green-600 text-white rounded-2xl shadow-xl px-5 py-4 border border-green-500 flex items-start gap-3"
          >
            <CheckCircle size={22} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{successMessage}</p>
            </div>
            <button
              onClick={() => setSuccessMessage("")}
              className="text-white/80 hover:text-white font-bold text-xs"
            >
              OK
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Cancellation Confirmation Modal */}
      <ConfirmModal
        isOpen={!!tripToCancel}
        title={language === "ar" ? "إلغاء حجز الرحلة؟" : "Cancel Trip Booking?"}
        message={
          language === "ar"
            ? `هل أنت متأكد من رغبتك في إلغاء حجز رحلتك "${tripToCancel?.title[language] || tripToCancel?.title.en}"؟ سيتم رد المبلغ المدفوع (${tripToCancel ? formatAmount(tripToCancel.amount, language) : ""}) تلقائياً إلى محفظتك الإلكترونية أو بطاقتك.`
            : `Are you sure you want to cancel your booked trip "${tripToCancel?.title[language] || tripToCancel?.title.en}"? Your payment of ${tripToCancel ? formatAmount(tripToCancel.amount, language) : ""} will be automatically refunded.`
        }
        cancelLabel={t("common.cancel") || (language === "ar" ? "تراجع" : "Keep Booking")}
        confirmLabel={language === "ar" ? "تأكيد الإلغاء" : "Yes, Cancel Booking"}
        error={cancellationError}
        isLoading={isCancelling}
        onCancel={() => setTripToCancel(null)}
        onConfirm={confirmCancellation}
      />
    </div>
  );
}
