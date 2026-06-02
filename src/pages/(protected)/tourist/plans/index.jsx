import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../../../../context/LanguageContext";
import * as plansBackend from "./backend/plansBackend";
import { BookingSettings } from "./components/BookingSettings";
import { BookingStatusModal } from "./components/BookingStatusModal";
import { PlansGrid } from "./components/PlansGrid";
import { PlansHeader } from "./components/PlansHeader";
import { RecommendedDestinationBanner } from "./components/RecommendedDestinationBanner";
import { Modal, PaymentConfirmationModal } from "../../../../components/ui";
import {
  mergeBookingInfo,
  saveCurrentBookingId,
  saveCurrentBookingPlan,
} from "../../../../services/booking-session";
import {
  extractBookingId,
  formatAmount,
  getSavedDurationHours,
  getSavedStartTime,
  mapPaymentMethod,
  parseBookingDateTime,
  readBookingInfo,
} from "./components/planUtils";

// Plans lets the user choose a generated or custom travel plan before booking.
export default function Plans() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isRTL, language, t } = useLanguage();

  const queryParams = new URLSearchParams(location.search);
  const destId = queryParams.get("destId") ? Number(queryParams.get("destId")) : null;
  const [destinations, setDestinations] = useState([]);
  const [plans, setPlans] = useState([]);
  const [tripDetailsById, setTripDetailsById] = useState({});

  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [startTime, setStartTime] = useState(getSavedStartTime);
  const [durationHours, setDurationHours] = useState(getSavedDurationHours);
  const [deletingPlanId, setDeletingPlanId] = useState(null);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [isLoadingDestinations, setIsLoadingDestinations] = useState(true);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [hasLoadingDelay, setHasLoadingDelay] = useState(true);
  const [plansError, setPlansError] = useState("");
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingStatus, setBookingStatus] = useState({ isOpen: false, isSuccess: false, message: "" });
  const [bookingToConfirm, setBookingToConfirm] = useState(null);
  const bookingInfo = useMemo(() => readBookingInfo(), []);
  const bookingDate = String(bookingInfo.date || "");
  const parsedDurationHours = Number(durationHours);
  const hasValidBookingDetails =
    /^\d{4}-\d{2}-\d{2}$/.test(bookingDate) &&
    /^([01]\d|2[0-3]):([0-5]\d)$/.test(startTime) &&
    Number.isInteger(parsedDurationHours) &&
    parsedDurationHours > 0;

  const destinationMap = useMemo(
    () => new Map(destinations.map((destination) => [destination.id, destination])),
    [destinations]
  );
  useEffect(() => {
    const timer = setTimeout(() => setHasLoadingDelay(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadDestinations = async () => {
      try {
        if (!cancelled) setIsLoadingDestinations(true);
        const data = await plansBackend.getDestinations();
        if (!cancelled) setDestinations(data);
      } catch {
        if (!cancelled) setDestinations(await plansBackend.getDestinations());
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

    const loadTrips = async () => {
      try {
        setIsLoadingPlans(true);
        setPlansError("");
        const readyPlans = await plansBackend.getTrips();

        if (!cancelled) {
          setPlans(readyPlans);
        }
      } catch (error) {
        if (!cancelled) {
          setPlans([]);
          setPlansError(error?.message || "Error retrieving.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingPlans(false);
        }
      }
    };

    loadTrips();
    return () => {
      cancelled = true;
    };
  }, []);

  const contextDest = destId ? destinationMap.get(destId) : null;

  // Filter plans to only those that mention the selected destination (either in
  // the plan.destinations array or in the trip details' placeIds if available).
  const filteredPlans = useMemo(() => {
    if (!destId) return plans;
    return plans.filter((plan) => {
      if (Array.isArray(plan.destinations) && plan.destinations.includes(destId)) return true;
      const details = tripDetailsById[plan.tripId];
      if (details && Array.isArray(details.placeIds) && details.placeIds.includes(destId)) return true;
      return false;
    });
  }, [destId, plans, tripDetailsById]);

  const autoSelectedPlanId = useMemo(() => {
    if (!destId) return null;
    const matchingPlan = filteredPlans.find((plan) => plan.destinations.includes(destId) || (Array.isArray(tripDetailsById[plan.tripId]?.placeIds) && tripDetailsById[plan.tripId].placeIds.includes(destId)));
    return matchingPlan ? matchingPlan.id : null;
  }, [destId, filteredPlans, tripDetailsById]);

  const activePlanId = selectedPlanId || autoSelectedPlanId;
  const activePlan = plans.find((plan) => plan.id === activePlanId) || null;
  const isPlansLoading = isLoadingPlans || isLoadingDestinations || hasLoadingDelay;
  const [activeTab, setActiveTab] = useState("matching"); // "matching" | "all"

  const displayedPlans = useMemo(() => {
    if (!destId) return plans;
    return activeTab === "matching" ? filteredPlans : plans;
  }, [destId, activeTab, filteredPlans, plans]);

  useEffect(() => {
    let cancelled = false;

    const loadTripDetails = async () => {
      if (!activePlan || !Number.isFinite(Number(activePlan.tripId))) return;
      const tripId = Number(activePlan.tripId);
      if (tripDetailsById[tripId]) return;

      try {
        const payload = await plansBackend.getTripById(tripId);
        if (!payload || cancelled) return;
        setTripDetailsById((prev) => ({ ...prev, [tripId]: payload }));
      } catch {
        // Keep existing plan data when details endpoint fails.
      }
    };

    loadTripDetails();
    return () => {
      cancelled = true;
    };
  }, [activePlan, tripDetailsById]);

  const buildBookingDraft = () => {
    if (!activePlanId) {
      alert(t("validation.selectPlanFirst"));
      return null;
    }

    if (!hasValidBookingDetails) {
      alert(t("validation.fillAllFields"));
      return null;
    }
    
    const selectedPlan = plans.find((plan) => plan.id === activePlanId);
    if (!selectedPlan) {
      alert(t("validation.selectPlanFirst"));
      return null;
    }
    const startDate = parseBookingDateTime(bookingDate, startTime);
    if (!startDate) {
      alert(t("validation.fillAllFields"));
      return null;
    }
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + parsedDurationHours);

    const selectedTripDetails = tripDetailsById[selectedPlan.tripId];
    const selectedDestinations = Array.isArray(selectedTripDetails?.placeIds)
      ? selectedTripDetails.placeIds
      : selectedPlan.destinations;
    const planData = {
      planId: activePlanId,
      tripId: selectedPlan.tripId,
      title: selectedPlan.title[language] || selectedPlan.title.en,
      destinationIds: selectedDestinations,
      date: bookingDate,
      duration: `${parsedDurationHours}h`,
      startTime,
      amount: selectedPlan.price,
      guideId: selectedPlan.guideId,
      guideName: selectedPlan.guideName,
    };

    return { selectedPlan, startDate, endDate, planData };
  };

  const handleSubmit = () => {
    const draft = buildBookingDraft();
    if (!draft) return;
    setBookingToConfirm(draft);
  };

  const confirmBooking = async () => {
    if (!bookingToConfirm || isSubmittingBooking) return;
    const { selectedPlan, startDate, endDate, planData } = bookingToConfirm;

    saveCurrentBookingPlan(planData);
    mergeBookingInfo({ startTime, durationHours: parsedDurationHours });
    setIsSubmittingBooking(true);
    try {
      const bookingResponse = await plansBackend.createBooking({
        planId: selectedPlan.tripId,
        guideId: selectedPlan.guideId || null,
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
          await plansBackend.payBooking({ bookingId });
        }
      }
      setBookingStatus({
        isOpen: true,
        isSuccess: true,
        message: t("booking.confirmedWithAmount", {
          amount: formatAmount(selectedPlan.price, language),
        }) || "Booking confirmed.",
      });
      setBookingToConfirm(null);
    } catch (error) {
      setBookingStatus({
        isOpen: true,
        isSuccess: false,
        message: error?.message || "Booking failed. Please try again.",
      });
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // Show confirmation modal for deleting a plan (keeps UX consistent with other modals)
  const handleDeletePlan = (event, plan) => {
    event.stopPropagation();
    if (deletingPlanId === plan.id) return;
    setDeleteError("");
    setPlanToDelete(plan);
  };

  const confirmDeletePlan = async () => {
    if (!planToDelete) return;
    const plan = planToDelete;
    setPlanToDelete(null);
    setDeletingPlanId(plan.id);
    setDeleteError("");

    try {
      await plansBackend.deleteTrip(plan.tripId);

      // Remove from UI
      setPlans((prev) => prev.filter((item) => item.id !== plan.id));
      setTripDetailsById((prev) => {
        if (!(plan.tripId in prev)) return prev;
        const next = { ...prev };
        delete next[plan.tripId];
        return next;
      });
      setSelectedPlanId((prev) => (prev === plan.id ? null : prev));
    } catch (err) {
      // If deletion failed, double-check whether the trip still exists on the server.
      // Some backends may return an error even when the resource was removed.
      try {
        const check = await plansBackend.getTripById(plan.tripId);
        if (!check) {
          // Trip appears removed despite the error — treat as success.
          setPlans((prev) => prev.filter((item) => item.id !== plan.id));
          setTripDetailsById((prev) => {
            if (!(plan.tripId in prev)) return prev;
            const next = { ...prev };
            delete next[plan.tripId];
            return next;
          });
          setSelectedPlanId((prev) => (prev === plan.id ? null : prev));
        } else {
          // Still exists — surface an error to the user via the modal
          setDeleteError(err?.message || "Failed to delete trip. Please try again.");
        }
      } catch {
        setDeleteError(err?.message || "Failed to delete trip. Please try again.");
      }
    } finally {
      setDeletingPlanId(null);
    }
  };

  const closeBookingStatus = () => {
    const shouldNavigate = bookingStatus.isSuccess;
    setBookingStatus({ isOpen: false, isSuccess: false, message: "" });
    if (shouldNavigate) navigate("/tourist/home");
  };

  return (
    <div className="min-h-screen bg-[#ead9c5] px-4 py-5 text-black font-sans pb-36" dir={isRTL ? "rtl" : "ltr"}>
      <PlansHeader
        isRTL={isRTL}
        navigate={navigate}
        title={t("plans.title")}
        createLabel={t("createPlan.title")}
        destId={destId}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        t={t}
        language={language}
      />

      <RecommendedDestinationBanner destination={contextDest} language={language} isRTL={isRTL} t={t} />
      <div className="max-w-6xl mx-auto px-2">
        <main
          className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 overflow-y-auto max-h-[calc(100vh-360px)] pr-2 pb-8 scrollbar-thin"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#c59d75 transparent'
          }}
        >
          <PlansGrid
            plans={displayedPlans}
            destId={activeTab === "matching" ? destId : null}
            navigate={navigate}
            isLoading={isPlansLoading}
            plansError={plansError}
            activePlanId={activePlanId}
            tripDetailsById={tripDetailsById}
            destinationMap={destinationMap}
            deletingPlanId={deletingPlanId}
            isRTL={isRTL}
            language={language}
            t={t}
            onSelectPlan={setSelectedPlanId}
            onDeletePlan={handleDeletePlan}
          />
        </main>
      </div>

      <BookingSettings
        bookingDate={bookingDate}
        durationHours={durationHours}
        startTime={startTime}
        isSubmittingBooking={isSubmittingBooking}
        hasValidBookingDetails={hasValidBookingDetails}
        destId={destId}
        navigate={navigate}
        t={t}
        onDurationChange={setDurationHours}
        onStartTimeChange={setStartTime}
        onSubmit={handleSubmit}
        activePlan={activePlan}
        language={language}
      />

      <BookingStatusModal bookingStatus={bookingStatus} t={t} onClose={closeBookingStatus} />

      <PaymentConfirmationModal
        isOpen={!!bookingToConfirm}
        onClose={() => setBookingToConfirm(null)}
        title={t("booking.confirmPaymentTitle") || "Confirm Payment"}
        itemTitle={bookingToConfirm?.planData.title || ""}
        subtitle={
          bookingToConfirm?.selectedPlan.guideName
            ? `${t("booking.withGuide") || "With Guide"}: ${bookingToConfirm.selectedPlan.guideName}`
            : ""
        }
        amountLabel={t("booking.amountDue")}
        amount={bookingToConfirm ? formatAmount(bookingToConfirm.selectedPlan.price, language) : ""}
        details={[
          { label: t("createPlan.dateLabel") || "Date", value: bookingDate },
          { label: t("createPlan.startTimeLabel") || "Time", value: startTime },
          { label: t("createPlan.durationLabel") || "Duration", value: `${parsedDurationHours} ${t("createPlan.hours")}` },
        ]}
        message={
          bookingToConfirm
            ? t("booking.confirmPaymentBody", { amount: formatAmount(bookingToConfirm.selectedPlan.price, language) })
            : ""
        }
        cancelLabel={t("common.cancel")}
        confirmLabel={t("booking.confirmAndPay")}
        loadingLabel={t("booking.submitting")}
        isLoading={isSubmittingBooking}
        isRTL={isRTL}
        onConfirm={confirmBooking}
      />


      <Modal
        isOpen={!!planToDelete}
        onClose={() => setPlanToDelete(null)}
        title={t("plans.deleteTrip") || "Delete Trip"}
        maxWidth="max-w-md"
      >
        <p className="text-gray-600 text-lg mb-8">{t("plans.deleteTripConfirm") || "Are you sure you want to delete this trip?"}</p>
        {deleteError && <p className="text-sm text-red-600 mb-4">{deleteError}</p>}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setPlanToDelete(null)}
            className="px-6 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
          >
            {t("common.close") || "Close"}
          </button>
          <button
            type="button"
            onClick={confirmDeletePlan}
            disabled={!planToDelete || deletingPlanId === planToDelete?.id}
            className="px-6 py-3 rounded-2xl bg-[#d43e0b] text-white font-bold hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {deletingPlanId === planToDelete?.id ? (t("common.loading") || "Loading...") : (t("plans.deleteTrip") || "Delete")}
          </button>
        </div>
      </Modal>
    </div>
  );
}
