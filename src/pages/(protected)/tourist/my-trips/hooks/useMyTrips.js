import { useEffect, useMemo, useState } from "react";
import * as myTripsBackend from "../backend/myTripsBackend";

const INACTIVE_TRIP_STATUSES = new Set(["cancelled", "canceled", "rejected"]);

export function isInactiveTrip(trip) {
  return INACTIVE_TRIP_STATUSES.has(String(trip?.status || "").toLowerCase());
}

// Owns tourist bookings loading, tab filtering, guide chat, and cancellation flow.
export function useMyTrips({ navigate, language }) {
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [tripToCancel, setTripToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancellationError, setCancellationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadTrips = async () => {
      try {
        const data = await myTripsBackend.loadMyTrips();
        if (!cancelled) {
          setError("");
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

    loadTrips();
    return () => {
      cancelled = true;
    };
  }, []);

  const messageGuide = async (trip) => {
    if (!trip.guideId) return;

    if (trip.conversationId) {
      navigate(`/chats/${trip.conversationId}`);
      return;
    }

    try {
      const conversationId = await myTripsBackend.getOrCreateConversation(trip.guideId);
      navigate(conversationId ? `/chats/${conversationId}` : "/chats");
    } catch {
      navigate("/chats");
    }
  };

  const requestCancellation = (event, trip) => {
    event.stopPropagation();
    setTripToCancel(trip);
    setCancellationError("");
    setSuccessMessage("");
  };

  const closeCancellation = () => {
    setTripToCancel(null);
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

      setTrips((prev) =>
        prev.map((trip) => (trip.id === tripToCancel.id ? { ...trip, status: "cancelled" } : trip))
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

  return {
    activeTab,
    setActiveTab,
    filteredTrips,
    isLoading,
    error,
    tripToCancel,
    isCancelling,
    cancellationError,
    successMessage,
    setSuccessMessage,
    messageGuide,
    requestCancellation,
    closeCancellation,
    confirmCancellation,
  };
}
