import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, MessageCircle, X } from "lucide-react";
import { useLanguage } from "../../../../context/LanguageContext";
import { useAuth } from "../../../../context/AuthContext";
import { Modal } from "../../../../components/ui";
import * as homeBackend from "./backend/homeBackend";
import UpcomingTrips from "./components/UpcomingTrips";
import ActivitiesSection from "./components/ActivitiesSection";
import PopularSection from "./components/PopularSection";
import { ACTIVITY_IDS, POPULAR_IDS } from "./components/homeCards";

// TouristHome is the tourist dashboard with trips, activities, and destinations.
export default function TouristHome() {
  const navigate = useNavigate();
  const { isRTL, t, language } = useLanguage();
  const { user } = useAuth();
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
        if (!cancelled) setIsLoadingDestinations(true);
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
        if (!cancelled) setIsLoadingUpcomingTrips(true);
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
    () => destinations.filter((d) => ACTIVITY_IDS.includes(d.id)),
    [destinations]
  );
  const popularDestinations = useMemo(
    () => destinations.filter((d) => POPULAR_IDS.includes(d.id)),
    [destinations]
  );
  
  const handleChat = async (trip) => {
    if (trip.conversationId) {
      navigate(`/chats/${trip.conversationId}`);
      return;
    }
    if (trip.guideId) {
      try {
        const conversationId = await homeBackend.getOrCreateConversation(trip.guideId);
        if (conversationId) {
          navigate(`/chats/${conversationId}`);
        } else {
          navigate(`/chats/conv-${trip.guideId}`);
        }
      } catch (err) {
        console.error("Failed to navigate/create conversation:", err);
        navigate(`/chats/conv-${trip.guideId}`);
      }
    }
  };

  const handleCancelTrip = async (trip) => {
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
  
  const confirmCancelTrip = async () => {
    if (!tripToCancel) return;
    const target = tripToCancel;
    setTripToCancel(null);
    await handleCancelTrip(target);
  };
  
  const isHomeContentLoading = isLoadingDestinations || isLoadingUpcomingTrips;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F2E0CA" }}>

      <main className="pt-24 pb-16">
        {isHomeContentLoading ? (
          <section className="max-w-[1200px] mx-auto px-6 py-8 animate-pulse">
            <div className="h-10 w-72 mx-auto rounded-xl bg-black/10 mb-10" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={`upcoming-skeleton-${index}`} className="h-28 rounded-2xl bg-black/10" />
              ))}
            </div>
            <div className="h-10 w-64 mx-auto rounded-xl bg-black/10 mb-10" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-14">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={`activities-skeleton-${index}`} className="h-60 rounded-[32px] bg-black/10" />
              ))}
            </div>
            <div className="h-10 w-64 mx-auto rounded-xl bg-black/10 mb-10" />
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={`popular-skeleton-${index}`} className="w-[280px] h-40 rounded-2xl bg-black/10 shrink-0" />
              ))}
            </div>
          </section>
        ) : (
          <>
        <UpcomingTrips
          upcomingTrips={upcomingTrips}
          isLoadingUpcomingTrips={isLoadingUpcomingTrips}
          isRTL={isRTL}
          language={language}
          t={t}
          requestCancelTrip={requestCancelTrip}
          cancellingTripId={cancellingTripId}
          onChat={handleChat}
        />

        <ActivitiesSection activityDestinations={activityDestinations} isRTL={isRTL} t={t} />

            <PopularSection popularDestinations={popularDestinations} isRTL={isRTL} t={t} />
          </>
        )}
      </main>

      <Modal
        isOpen={!!tripToCancel}
        onClose={() => setTripToCancel(null)}
        title={t("destination.cancelTrip")}
        maxWidth="max-w-md"
      >
        <p className="text-gray-600 text-lg mb-8">
          {t("tourist.home.cancelTripConfirm") || "Are you sure you want to cancel this trip?"}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setTripToCancel(null)}
            className="px-6 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
          >
            {t("common.close") || "Close"}
          </button>
          <button
            type="button"
            onClick={confirmCancelTrip}
            disabled={!tripToCancel || cancellingTripId === tripToCancel.id}
            className="px-6 py-3 rounded-2xl bg-[#d43e0b] text-white font-bold hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {cancellingTripId === tripToCancel?.id
              ? (t("common.loading") || "Loading...")
              : (t("destination.cancelTrip") || "Cancel Trip")}
          </button>
        </div>
      </Modal>

    </div>
  );
}
