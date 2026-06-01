import { useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../../context/LanguageContext";
import { Modal } from "../../../../components/common/Modal";
import { tourismApi } from "../../../../services/tourism-api";
import { upsertStoredConversation } from "../../../../services/conversations-store";
import { GuideCard } from "./components/GuideCard";
import {
  extractArray,
  extractBookingId,
  extractConversationId,
  mapPaymentMethod,
  normalizeGuide,
  parseDateString,
  parseDurationDays,
} from "./components/guideMappers";

// AvailableGuides lists bookable guides and starts guide chat or booking actions.
export default function AvailableGuides() {
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [guides, setGuides] = useState([]);
  const [isLoadingGuides, setIsLoadingGuides] = useState(true);
  const [guidesError, setGuidesError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadGuides = async () => {
      try {
        setIsLoadingGuides(true);
        setGuidesError("");
        const response = await tourismApi.getGuides();
        const apiGuides = extractArray(response).map(normalizeGuide).filter((guide) => guide.id);
        if (!cancelled) {
          setGuides(apiGuides);
        }
        return;
      } catch {
        // Fallback to users list when guides endpoint is unavailable.
      }

      try {
        const usersResponse = await tourismApi.getUsers();
        const users = extractArray(usersResponse);
        const guideUsers = users.filter((user) => {
          const role = String(user?.role ?? user?.userRole ?? user?.type ?? "").toLowerCase();
          return role === "guide";
        });
        const normalizedGuides = guideUsers.map(normalizeGuide).filter((guide) => guide.id);
        if (!cancelled) {
          setGuides(normalizedGuides);
        }
        return;
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
    try {
      const bookingPlan = JSON.parse(localStorage.getItem("current_booking_plan") || "{}");
      const numeric = Number(bookingPlan?.tripId ?? bookingPlan?.planId);
      return Number.isFinite(numeric) ? numeric : null;
    } catch {
      return null;
    }
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
    setSelectedGuide(guide);
    const bookingPlan = JSON.parse(localStorage.getItem("current_booking_plan") || "{}");
    const upcomingTrips = JSON.parse(localStorage.getItem("upcoming_trips") || "[]");
    const conversationId = await ensureConversation(guide);

    const tripTypeObj = typeof bookingPlan.title === 'string' 
      ? { [language]: bookingPlan.title, [language === 'ar' ? 'en' : 'ar']: bookingPlan.title }
      : { en: "Custom Plan", ar: "خطة مخصصة" };

    const dateObj = typeof bookingPlan.date === 'string'
      ? { [language]: bookingPlan.date, [language === 'ar' ? 'en' : 'ar']: bookingPlan.date }
      : { en: "Pending confirmation", ar: "في انتظار التأكيد" };

    upcomingTrips.push({
      id: Date.now().toString(),
      guideName: guide.name, 
      guideImage: guide.image,
      tripType: tripTypeObj,
      date: dateObj,
      conversationId: conversationId ?? `conv-${guide.id}`
    });
    // Persist the selected guide so other flows (e.g., booking from Plans) can use it
    try {
      localStorage.setItem("selected_guide", JSON.stringify(guide));
    } catch (e) {
      // ignore storage errors
    }
    localStorage.setItem("upcoming_trips", JSON.stringify(upcomingTrips));

    const bookingInfo = JSON.parse(localStorage.getItem("user_booking_info") || "{}");
    const baseDate = parseDateString(bookingPlan.date) || new Date();
    const durationDays = parseDurationDays(bookingPlan.duration);
    const startDate = new Date(baseDate);
    const endDate = new Date(baseDate);
    endDate.setDate(endDate.getDate() + durationDays);

    if (selectedTripId) {
      tourismApi
        .createBooking({
          planId: selectedTripId,
          guideId: guide.id || null,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          numberOfPeople: Number(bookingInfo.numberOfPeople || 1),
          paymentMethod: mapPaymentMethod(bookingInfo.paymentMethod),
          usePoints: false,
        })
        .then((bookingResponse) => {
          const bookingId = extractBookingId(bookingResponse);
          if (bookingId) {
            localStorage.setItem("current_booking_id", String(bookingId));
            if (mapPaymentMethod(bookingInfo.paymentMethod) === "Visa") {
              tourismApi.payBooking({ bookingId }).catch(() => {});
            }
          }
        })
        .catch(() => {});
    }

    if (selectedTripId && guide.id) {
      tourismApi.createGuideRequest({
        tripId: selectedTripId,
        guideId: guide.id,
      }).catch(() => {});
    }

    setIsSuccessModalOpen(true);
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
              <div className="col-span-full py-14 text-center bg-black/5 rounded-[40px] border-2 border-dashed border-black/10">
                <p className="text-gray-600 font-bold italic">{t("common.loading") || "Loading..."}</p>
              </div>
            ) : guidesError ? (
              <div className="col-span-full py-14 text-center bg-red-50 rounded-[40px] border-2 border-red-200">
                <p className="text-red-700 font-bold italic">{t("availableGuides.errorLoading")}</p>
              </div>
            ) : guides.length === 0 ? (
              <div className="col-span-full py-14 text-center bg-black/5 rounded-[40px] border-2 border-dashed border-black/10">
                <p className="text-gray-600 font-bold italic">{t("availableGuides.noGuides")}</p>
              </div>
            ) : (
              guides.map((guide) => (
                <GuideCard
                  key={guide.id}
                  guide={guide}
                  onBook={handleBook}
                  onChat={handleChat}
                  language={language}
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
