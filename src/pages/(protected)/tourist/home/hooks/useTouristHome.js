import { useEffect, useMemo, useState } from "react";
import * as homeBackend from "../backend/homeBackend";
import { ACTIVITY_IDS, POPULAR_IDS } from "../components/homeCards";

// Coordinates tourist dashboard loading, trip chat, and cancellation state.
export function useTouristHome({ user, navigate, t }) {
  const [destinations, setDestinations] = useState([]);
  const [isLoadingDestinations, setIsLoadingDestinations] = useState(true);
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [isLoadingUpcomingTrips, setIsLoadingUpcomingTrips] = useState(true);
  const [cancellingTripId, setCancellingTripId] = useState(null);
  const [tripToCancel, setTripToCancel] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadDestinations = async () => {
      try {
        const data = await homeBackend.getDestinations();
        if (!cancelled) setDestinations(data);
      } catch {
        if (!cancelled) setDestinations([]);
      } finally {
        if (!cancelled) setIsLoadingDestinations(false);
      }
    };

    loadDestinations();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadBookings = async () => {
      if (!user) {
        if (!cancelled) {
          setUpcomingTrips([]);
          setIsLoadingUpcomingTrips(false);
        }
        return;
      }

      try {
        const mapped = await homeBackend.getUpcomingTrips(user);
        if (!cancelled) setUpcomingTrips(mapped);
      } catch {
        if (!cancelled) setUpcomingTrips([]);
      } finally {
        if (!cancelled) setIsLoadingUpcomingTrips(false);
      }
    };

    loadBookings();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const activityDestinations = useMemo(
    () => destinations.filter((destination) => ACTIVITY_IDS.includes(destination.id)),
    [destinations]
  );

  const popularDestinations = useMemo(
    () => destinations.filter((destination) => POPULAR_IDS.includes(destination.id)),
    [destinations]
  );

  const openTripChat = async (trip) => {
    if (trip.conversationId) {
      navigate(`/chats/${trip.conversationId}`);
      return;
    }

    if (!trip.guideId) return;

    try {
      const conversationId = await homeBackend.getOrCreateConversation(trip.guideId);
      navigate(`/chats/${conversationId || `conv-${trip.guideId}`}`);
    } catch {
      navigate(`/chats/conv-${trip.guideId}`);
    }
  };

  const cancelTrip = async (trip) => {
    if (!trip?.id || cancellingTripId === trip.id) return;
    setCancellingTripId(trip.id);

    try {
      await homeBackend.cancelTrip(trip);
      setUpcomingTrips((prev) => prev.filter((item) => item.id !== trip.id));
    } catch {
      alert(t("destination.cancelTripFailed"));
    } finally {
      setCancellingTripId(null);
    }
  };

  const requestCancelTrip = (trip) => {
    if (!trip?.id || cancellingTripId === trip.id) return;
    setTripToCancel(trip);
  };

  const closeCancelTrip = () => setTripToCancel(null);

  const confirmCancelTrip = async () => {
    if (!tripToCancel) return;
    const target = tripToCancel;
    setTripToCancel(null);
    await cancelTrip(target);
  };

  return {
    activityDestinations,
    popularDestinations,
    upcomingTrips,
    isLoadingUpcomingTrips,
    isHomeContentLoading: isLoadingDestinations || isLoadingUpcomingTrips,
    cancellingTripId,
    tripToCancel,
    openTripChat,
    requestCancelTrip,
    closeCancelTrip,
    confirmCancelTrip,
  };
}
