import { useCallback, useEffect, useMemo, useState } from "react";
import { tourismApi } from "../../../../../services/tourism-api";
import { upsertStoredConversation } from "../../../../../services/conversations-store";
import {
  addUpcomingTrip,
  clearBookingSession,
  readBookingInfo,
  readCurrentBookingId,
  readCurrentBookingPlan,
  readSelectedTripId,
  saveCurrentBookingId,
  saveSelectedGuide,
} from "../../../../../services/booking-session";
import {
  extractBookingId,
  extractConversationId,
  mapPaymentMethod,
} from "../../../../../services/mappers/booking.mapper";
import { parseBookingDateTime } from "../../../../../shared/utils/dates";
import { extractArray } from "../../../../../shared/utils/api-shapes";
import {
  normalizeGuide,
  parseDateString,
  parseDurationDays,
} from "../../../../../features/guides/guideMappers";

// Owns guide loading, booking, conversation creation, and booking-session writes.
export function useAvailableGuides({ language, onChatReady, onBookingComplete }) {
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [guides, setGuides] = useState([]);
  const [isLoadingGuides, setIsLoadingGuides] = useState(true);
  const [isBookingGuide, setIsBookingGuide] = useState(false);
  const [guidesError, setGuidesError] = useState("");

  const selectedTripId = useMemo(() => readSelectedTripId(), []);

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

  const ensureConversation = useCallback(async (guide) => {
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
  }, [language]);

  const bookGuide = useCallback(async (guide) => {
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

      const tripTypeObj = typeof bookingPlan.title === "string"
        ? { [language]: bookingPlan.title, [language === "ar" ? "en" : "ar"]: bookingPlan.title }
        : { en: "Custom Plan", ar: "خطة مخصصة" };
      const dateObj = typeof bookingPlan.date === "string"
        ? { [language]: bookingPlan.date, [language === "ar" ? "en" : "ar"]: bookingPlan.date }
        : { en: "Pending confirmation", ar: "في انتظار التأكيد" };

      addUpcomingTrip({
        id: readCurrentBookingId() || Date.now().toString(),
        guideName: guide.name,
        guideImage: guide.image,
        tripType: tripTypeObj,
        date: dateObj,
        conversationId: conversationId ?? `conv-${guide.id}`,
      });
      setIsSuccessModalOpen(true);
      onBookingComplete?.();
    } catch (error) {
      setGuidesError(error?.message || "Could not complete guide booking.");
    } finally {
      setIsBookingGuide(false);
    }
  }, [ensureConversation, isBookingGuide, language, onBookingComplete, selectedTripId]);

  const chatWithGuide = useCallback(async (guide) => {
    const conversationId = await ensureConversation(guide);
    onChatReady?.(conversationId ?? `conv-${guide.id}`);
  }, [ensureConversation, onChatReady]);

  const closeSuccessModal = useCallback(() => {
    clearBookingSession();
    setIsSuccessModalOpen(false);
  }, []);

  return {
    guides,
    selectedGuide,
    isSuccessModalOpen,
    isLoadingGuides,
    isBookingGuide,
    guidesError,
    bookGuide,
    chatWithGuide,
    closeSuccessModal,
  };
}
