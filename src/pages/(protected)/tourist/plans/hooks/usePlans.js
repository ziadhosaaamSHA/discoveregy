import { useEffect, useMemo, useState } from "react";
import * as plansBackend from "../backend/plansBackend";
import {
  clearBookingSession,
  mergeBookingInfo,
  saveCurrentBookingId,
  saveCurrentBookingPlan,
} from "../../../../../services/booking-session";
import {
  extractBookingId,
  formatAmount,
  getSavedDurationHours,
  getSavedStartTime,
  mapPaymentMethod,
  parseBookingDateTime,
  readBookingInfo,
} from "../components/planUtils";

// Owns plan loading/filtering, booking payment confirmation, and custom trip deletion.
export function usePlans({ destId, language, navigate, t }) {
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
  const [plansError, setPlansError] = useState("");
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingStatus, setBookingStatus] = useState({ isOpen: false, isSuccess: false, message: "" });
  const [bookingToConfirm, setBookingToConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState("matching");
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
    let cancelled = false;

    const loadInitialData = async () => {
      try {
        const [destData, tripData] = await Promise.all([
          plansBackend.getDestinations(),
          plansBackend.getTrips(),
        ]);

        if (!cancelled) {
          setPlansError("");
          setDestinations(destData);
          setPlans(tripData);
        }
      } catch (error) {
        if (!cancelled) {
          setPlans([]);
          setPlansError(error?.message || "Error retrieving trips.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingDestinations(false);
          setIsLoadingPlans(false);
        }
      }
    };

    loadInitialData();
    return () => {
      cancelled = true;
    };
  }, []);

  const contextDest = destId ? destinationMap.get(destId) : null;

  const filteredPlans = useMemo(() => {
    if (!destId) return plans;
    return plans.filter((plan) => {
      if (Array.isArray(plan.destinations) && plan.destinations.includes(destId)) return true;
      const details = tripDetailsById[plan.tripId];
      return Boolean(details && Array.isArray(details.placeIds) && details.placeIds.includes(destId));
    });
  }, [destId, plans, tripDetailsById]);

  const autoSelectedPlanId = useMemo(() => {
    if (!destId || filteredPlans.length === 0) return null;
    return filteredPlans[0].id;
  }, [destId, filteredPlans]);

  const activePlanId = selectedPlanId || autoSelectedPlanId;
  const activePlan = useMemo(() => plans.find((plan) => plan.id === activePlanId) || null, [plans, activePlanId]);
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
    if (!activePlan) {
      alert(t("validation.selectPlanFirst"));
      return null;
    }

    if (!hasValidBookingDetails) {
      alert(t("validation.fillAllFields"));
      return null;
    }

    const startDate = parseBookingDateTime(bookingDate, startTime);
    if (!startDate) {
      alert(t("validation.fillAllFields"));
      return null;
    }

    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + parsedDurationHours);

    const selectedTripDetails = tripDetailsById[activePlan.tripId];
    const selectedDestinations = Array.isArray(selectedTripDetails?.placeIds)
      ? selectedTripDetails.placeIds
      : activePlan.destinations;

    return {
      selectedPlan: activePlan,
      startDate,
      endDate,
      planData: {
        planId: activePlanId,
        tripId: activePlan.tripId,
        title: activePlan.title[language] || activePlan.title.en,
        destinationIds: selectedDestinations,
        date: bookingDate,
        duration: `${parsedDurationHours}h`,
        startTime,
        amount: activePlan.price,
        guideId: activePlan.guideId,
        guideName: activePlan.guideName,
      },
    };
  };

  const submitBooking = () => {
    const draft = buildBookingDraft();
    if (draft) setBookingToConfirm(draft);
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

  const requestDeletePlan = (event, plan) => {
    event.stopPropagation();
    if (deletingPlanId === plan.id) return;
    setDeleteError("");
    setPlanToDelete(plan);
  };

  const removePlanFromUI = (plan) => {
    setPlans((prev) => prev.filter((item) => item.id !== plan.id));
    setTripDetailsById((prev) => {
      if (!(plan.tripId in prev)) return prev;
      const next = { ...prev };
      delete next[plan.tripId];
      return next;
    });
    setSelectedPlanId((prev) => (prev === plan.id ? null : prev));
  };

  const confirmDeletePlan = async () => {
    if (!planToDelete) return;
    const plan = planToDelete;
    setPlanToDelete(null);
    setDeletingPlanId(plan.id);
    setDeleteError("");

    try {
      await plansBackend.deleteTrip(plan.tripId);
      removePlanFromUI(plan);
    } catch (err) {
      try {
        const check = await plansBackend.getTripById(plan.tripId);
        if (!check) {
          removePlanFromUI(plan);
        } else {
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
    if (shouldNavigate) clearBookingSession();
    setBookingStatus({ isOpen: false, isSuccess: false, message: "" });
    if (shouldNavigate) navigate("/tourist/home");
  };

  return {
    activeTab,
    setActiveTab,
    activePlan,
    activePlanId,
    bookingDate,
    bookingStatus,
    bookingToConfirm,
    contextDest,
    deleteError,
    deletingPlanId,
    destinationMap,
    displayedPlans,
    durationHours,
    hasValidBookingDetails,
    isPlansLoading: isLoadingPlans || isLoadingDestinations,
    isSubmittingBooking,
    parsedDurationHours,
    planToDelete,
    plansError,
    startTime,
    confirmBooking,
    confirmDeletePlan,
    closeBookingStatus,
    requestDeletePlan,
    setBookingToConfirm,
    setDurationHours,
    setPlanToDelete,
    setSelectedPlanId,
    setStartTime,
    submitBooking,
    tripDetailsById,
  };
}
