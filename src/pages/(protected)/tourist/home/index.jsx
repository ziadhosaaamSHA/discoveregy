import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "../../../../context/LanguageContext";
import { useAuth } from "../../../../context/AuthContext";
import { Button, Modal } from "../../../../components/ui";
import UpcomingTrips from "./components/UpcomingTrips";
import ActivitiesSection from "./components/ActivitiesSection";
import PopularSection from "./components/PopularSection";
import { useTouristHome } from "./hooks/useTouristHome";

// TouristHome is the tourist dashboard with trips, activities, and destinations.
export default function TouristHome() {
  const navigate = useNavigate();
  const { isRTL, t, language } = useLanguage();
  const { user } = useAuth();
  const {
    activityDestinations,
    popularDestinations,
    upcomingTrips,
    isLoadingUpcomingTrips,
    isHomeContentLoading,
    cancellingTripId,
    tripToCancel,
    openTripChat,
    requestCancelTrip,
    closeCancelTrip,
    confirmCancelTrip,
  } = useTouristHome({ user, navigate, t });

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
          onChat={openTripChat}
        />

        <ActivitiesSection activityDestinations={activityDestinations} isRTL={isRTL} t={t} />

            <PopularSection popularDestinations={popularDestinations} isRTL={isRTL} t={t} />
          </>
        )}
      </main>

      <Modal
        isOpen={!!tripToCancel}
        onClose={closeCancelTrip}
        title={t("destination.cancelTrip")}
        maxWidth="max-w-md"
      >
        <p className="text-gray-600 text-lg mb-8">
          {t("tourist.home.cancelTripConfirm") || "Are you sure you want to cancel this trip?"}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button
            type="button"
            onClick={closeCancelTrip}
            variant="muted"
          >
            {t("common.close") || "Close"}
          </Button>
          <Button
            type="button"
            onClick={confirmCancelTrip}
            disabled={!tripToCancel || cancellingTripId === tripToCancel.id}
            variant="danger"
          >
            {cancellingTripId === tripToCancel?.id
              ? (t("common.loading") || "Loading...")
              : (t("destination.cancelTrip") || "Cancel Trip")}
          </Button>
        </div>
      </Modal>

    </div>
  );
}
