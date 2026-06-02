import { useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../../context/LanguageContext";
import { tourismApi } from "../../../../services/tourism-api";
import { upsertStoredConversation } from "../../../../services/conversations-store";
import {
  addUpcomingTrip,
  readBookingInfo,
  readCurrentBookingId,
  readCurrentBookingPlan,
  readSelectedTripId,
  saveCurrentBookingId,
  saveSelectedGuide,
} from "../../../../services/booking-session";
import {
  extractBookingId,
  extractConversationId,
  mapPaymentMethod,
} from "../../../../services/mappers/booking.mapper";
import { parseBookingDateTime } from "../../../../shared/utils/dates";
import { extractArray } from "../../../../shared/utils/api-shapes";
import { EmptyState, LoadingState, Modal } from "../../../../components/ui";
import { GuideCard } from "./components/GuideCard";
import {
  normalizeGuide,
  parseDateString,
  parseDurationDays,
} from "../../../../features/guides/guideMappers";

// AvailableGuides lists bookable guides and starts guide chat or booking actions.
export default function AvailableGuides() {
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [guides, setGuides] = useState([]);
  const [isLoadingGuides, setIsLoadingGuides] = useState(true);
  const [isBookingGuide, setIsBookingGuide] = useState(false);
  const [guidesError, setGuidesError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadGuides = async () => {
      try {
        setIsLoadingGuides(true);
        setGuidesError("");
        const response = await tourismApi.getGuides();
        const nextGuides = extractArray(response).map(normalizeGuide).filter((guide) => guide.id);
        if (!cancelled) setGuides(nextGuides);
      } catch {
        if (!cancelled) {
          setGuides([]);
          setGuidesError("Error retrieving.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingGuides(false);
        }
      }
    };

    loadGuides();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedTripId = useMemo(() => {
    return readSelectedTripId();
  }, []);

  const ensureConversation = async (guide) => {
    try {
      const response = await tourismApi.createConversation({ guideId: guide.id });
      const conversationId = extractConversationId(response);
      if (!conversationId) return null;

      upsertStoredConversation({
        id: conversationId,
        touristName: guide.name?.[language] || guide.name?.en || "Guide",
      });
      return conversationId;
    } catch {
      return null;
    }
  };

  const handleBook = async (guide) => {
    if (isBookingGuide) return;
    setIsBookingGuide(true);
    setSelectedGuide(guide);
    try {
      const bookingPlan = readCurrentBookingPlan();
      const bookingInfo = readBookingInfo();
      saveSelectedGuide(guide);

      const conversationId = await ensureConversation(guide);
      const startDate =
        parseBookingDateTime(bookingPlan.date, bookingPlan.startTime || bookingInfo.startTime) ||
        parseDateString(bookingPlan.date) ||
        new Date();
      const endDate = new Date(startDate);
      const durationHours = Number(bookingInfo.durationHours || String(bookingPlan.duration || "").match(/\d+/)?.[0] || 0);
      if (Number.isFinite(durationHours) && durationHours > 0) {
        endDate.setHours(endDate.getHours() + durationHours);
      } else {
        endDate.setDate(endDate.getDate() + parseDurationDays(bookingPlan.duration));
      }

      if (selectedTripId && !readCurrentBookingId()) {
        const bookingResponse = await tourismApi.createBooking({
          planId: selectedTripId,
          guideId: guide.id || null,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          numberOfPeople: Number(bookingInfo.numberOfPeople || 1),
          paymentMethod: mapPaymentMethod(bookingInfo.paymentMethod),
          usePoints: false,
        });
        const bookingId = extractBookingId(bookingResponse);
        if (bookingId) {
          saveCurrentBookingId(bookingId);
          if (mapPaymentMethod(bookingInfo.paymentMethod) === "Visa") {
            await tourismApi.payBooking({ bookingId });
          }
        }
      }

      if (selectedTripId && guide.id) {
        tourismApi.createGuideRequest({
          tripId: selectedTripId,
          guideId: guide.id,
        }).catch(() => {});
      }

      const tripTypeObj = typeof bookingPlan.title === 'string' 
        ? { [language]: bookingPlan.title, [language === 'ar' ? 'en' : 'ar']: bookingPlan.title }
        : { en: "Custom Plan", ar: "خطة مخصصة" };

      const dateObj = typeof bookingPlan.date === 'string'
        ? { [language]: bookingPlan.date, [language === 'ar' ? 'en' : 'ar']: bookingPlan.date }
        : { en: "Pending confirmation", ar: "في انتظار التأكيد" };

      addUpcomingTrip({
        id: readCurrentBookingId() || Date.now().toString(),
        guideName: guide.name, 
        guideImage: guide.image,
        tripType: tripTypeObj,
        date: dateObj,
        conversationId: conversationId ?? `conv-${guide.id}`
      });
      setIsSuccessModalOpen(true);
    } catch (error) {
      setGuidesError(error?.message || t("availableGuides.bookingFailed"));
    } finally {
      setIsBookingGuide(false);
    }
  };

  const handleChat = async (guide) => {
    const conversationId = await ensureConversation(guide);
    navigate(`/chats/${conversationId ?? `conv-${guide.id}`}`);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F2E0CA" }}>

      <main className="pt-24 pb-16 px-6">
        <div className="max-w-[1240px] mx-auto py-10">
          <div className="flex items-center gap-6 mb-12">
            <button onClick={() => navigate(-1)} className="p-3 bg-white/50 hover:bg-white rounded-2xl shadow-sm transition-all active:scale-95">
              {isRTL ? <ChevronRight size={32} /> : <ChevronLeft size={32} />}
            </button>
            <h1 className="text-5xl font-black text-black tracking-tight">
              {t("availableGuides.title")}
            </h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {isLoadingGuides ? (
              <LoadingState>{t("common.loading") || "Loading..."}</LoadingState>
            ) : guidesError ? (
              <EmptyState tone="error">{t("availableGuides.errorLoading")}</EmptyState>
            ) : guides.length === 0 ? (
              <EmptyState>{t("availableGuides.noGuides")}</EmptyState>
            ) : (
              guides.map((guide) => (
                <GuideCard
                  key={guide.id}
                  guide={guide}
                  onBook={handleBook}
                  onChat={handleChat}
                  language={language}
                  isBooking={isBookingGuide && selectedGuide?.id === guide.id}
                />
              ))
            )}
          </div>
        </div>
      </main>

      <Modal 
        isOpen={isSuccessModalOpen} 
        onClose={() => navigate("/tourist/home")}
        title={t("availableGuides.successTitle")}
      >
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={48} className="text-green-600" strokeWidth={3} />
        </div>
        <p className="text-gray-600 text-lg mb-8 leading-relaxed">
          {t("availableGuides.successBody", { name: selectedGuide?.name[language] || selectedGuide?.name.en })}
        </p>
        <button
          onClick={() => navigate("/tourist/home")}
          className="w-full py-5 bg-[#e67e22] text-white text-xl font-black rounded-3xl shadow-lg hover:brightness-110 active:scale-95 transition-all"
        >
          {t("availableGuides.goTrips")}
        </button>
      </Modal>

    </div>
  );
}
