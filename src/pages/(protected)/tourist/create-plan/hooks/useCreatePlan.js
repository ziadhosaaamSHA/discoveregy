import { useEffect, useMemo, useState } from "react";
import * as createPlanBackend from "../backend/createPlanBackend";
import {
  clearCurrentBookingId,
  clearSelectedGuide,
  getSavedDurationHours,
  getSavedStartTime,
  mergeBookingInfo,
  readBookingInfo,
  saveCurrentBookingPlan,
} from "../../../../../services/booking-session";
import { extractTripId } from "../../../../../services/mappers/booking.mapper";
import { readTicketPrice } from "../../../../../services/mappers/place.mapper";
import { parseBookingDateTime } from "../../../../../shared/utils/dates";

export function createTimeOptions() {
  const options = [];
  for (let hour = 0; hour < 24; hour += 1) {
    for (let minute = 0; minute < 60; minute += 30) {
      const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      const period = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 || 12;
      const minuteLabel = String(minute).padStart(2, "0");
      options.push({ value, label: `${hour12}:${minuteLabel} ${period}` });
    }
  }
  return options;
}

export const TIME_OPTIONS = createTimeOptions();

// Owns AI plan generation, destination editing, payment confirmation, and custom trip persistence.
export function useCreatePlan({ language, navigate, t }) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlans, setGeneratedPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmittingPlan, setIsSubmittingPlan] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ isOpen: false, isSuccess: false, message: "" });
  const [bookingToConfirm, setBookingToConfirm] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [customDestinations, setCustomDestinations] = useState([]);
  const [showAddDestinations, setShowAddDestinations] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [startTime, setStartTime] = useState(getSavedStartTime);
  const [durationHours, setDurationHours] = useState(getSavedDurationHours);
  const bookingInfo = useMemo(() => readBookingInfo(), []);
  const bookingDate = String(bookingInfo.date || "");
  const parsedDurationHours = Number(durationHours);
  const hasValidBookingDetails =
    /^\d{4}-\d{2}-\d{2}$/.test(bookingDate) &&
    /^([01]\d|2[0-3]):([0-5]\d)$/.test(startTime) &&
    Number.isInteger(parsedDurationHours) &&
    parsedDurationHours > 0;

  useEffect(() => {
    let cancelled = false;

    const loadDestinations = async () => {
      try {
        const data = await createPlanBackend.getDestinations();
        if (!cancelled) setDestinations(data);
      } catch {
        if (!cancelled) setDestinations([]);
      }
    };

    loadDestinations();
    return () => {
      cancelled = true;
    };
  }, []);

  const generatePlans = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      const plans = await createPlanBackend.generatePlans(prompt, language);
      setGeneratedPlans(plans);
      setSelectedPlanId(null);
      setIsEditMode(false);
    } catch {
      alert("Error generating plan. Please check your connection or token.");
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedPlan = useMemo(
    () => generatedPlans.find((plan) => plan.id === selectedPlanId),
    [generatedPlans, selectedPlanId]
  );

  const selectPlan = (id) => {
    setSelectedPlanId(id);
    const plan = generatedPlans.find((item) => item.id === id);
    setCustomDestinations(plan.destinations || []);
    setIsEditMode(true);
  };

  const removeDestination = (id) => {
    setCustomDestinations((prev) => prev.filter((destination) => destination.id !== id));
  };

  const addDestination = (destination) => {
    if (!customDestinations.find((item) => item.id === destination.id)) {
      setCustomDestinations((prev) => [...prev, destination]);
    }
    setShowAddDestinations(false);
  };

  const filteredAvailableDestinations = useMemo(() => {
    return destinations.filter((destination) => {
      const name = destination.copy[language]?.name || destination.copy.en.name;
      return name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !customDestinations.find((customDestination) => customDestination.id === destination.id);
    });
  }, [searchQuery, customDestinations, language, destinations]);

  const customPlanAmount = useMemo(
    () => customDestinations.reduce((sum, destination) => sum + readTicketPrice(destination), 0),
    [customDestinations]
  );

  const submitCustomPlan = async () => {
    if (!selectedPlanId) {
      alert(t("validation.selectPlanFirst"));
      return;
    }

    if (!hasValidBookingDetails) {
      alert(t("validation.fillAllFields"));
      return;
    }

    if (customDestinations.length === 0) {
      alert(t("createPlan.emptyStops"));
      return;
    }

    if (!selectedPlan) {
      alert(t("validation.selectPlanFirst"));
      return;
    }

    const startDate = parseBookingDateTime(bookingDate, startTime);
    if (!startDate) {
      alert(t("validation.fillAllFields"));
      return;
    }

    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + parsedDurationHours);

    setBookingToConfirm({
      selectedPlan,
      startDate,
      endDate,
      amount: customPlanAmount,
    });
  };

  const confirmCustomPlan = async () => {
    if (!bookingToConfirm || isSubmittingPlan) return;
    const { selectedPlan, startDate, endDate, amount } = bookingToConfirm;
    setIsSubmittingPlan(true);

    try {
      const destinationNames = customDestinations
        .map((destination) => destination.copy?.[language]?.name || destination.copy?.en?.name)
        .filter(Boolean)
        .join(", ");

      const response = await createPlanBackend.createCustomTrip({
        Title: selectedPlan.title,
        Description: selectedPlan.text,
        StartDateTime: startDate.toISOString(),
        EndDateTime: endDate.toISOString(),
        Notes: prompt,
        Destination: destinationNames,
        Price: amount,
      });
      const createdTripId = extractTripId(response);
      if (!createdTripId) {
        throw new Error("Trip created successfully, but could not resolve trip ID. Please check your trips in the Plans section.");
      }

      const planData = {
        planId: selectedPlanId,
        tripId: createdTripId,
        title: selectedPlan.title,
        date: bookingDate,
        duration: `${parsedDurationHours}h`,
        startTime,
        destinations: customDestinations.map((destination) => destination.id),
        destinationIds: customDestinations.map((destination) => destination.id),
        amount,
      };

      saveCurrentBookingPlan(planData);
      mergeBookingInfo({ startTime, durationHours: parsedDurationHours });
      clearCurrentBookingId();
      clearSelectedGuide();

      setSaveStatus({
        isOpen: true,
        isSuccess: true,
        message: t("createPlan.chooseGuideNext") || "Custom plan saved. Choose a guide to complete booking.",
      });
      setBookingToConfirm(null);
    } catch (error) {
      setSaveStatus({
        isOpen: true,
        isSuccess: false,
        message: error?.message || "Could not save custom plan. Please try again.",
      });
    } finally {
      setIsSubmittingPlan(false);
    }
  };

  const closeSaveStatus = () => {
    const shouldNavigate = saveStatus.isSuccess;
    setSaveStatus({ isOpen: false, isSuccess: false, message: "" });
    if (shouldNavigate) navigate("/tourist/available-guides?mode=custom");
  };

  return {
    bookingDate,
    bookingToConfirm,
    customDestinations,
    customPlanAmount,
    durationHours,
    filteredAvailableDestinations,
    generatedPlans,
    hasValidBookingDetails,
    isDurationFilled: durationHours !== "" && durationHours !== null && durationHours !== undefined,
    isEditMode,
    isGenerating,
    isSubmittingPlan,
    prompt,
    saveStatus,
    searchQuery,
    selectedPlan,
    showAddDestinations,
    startTime,
    parsedDurationHours,
    addDestination,
    closeSaveStatus,
    confirmCustomPlan,
    generatePlans,
    removeDestination,
    selectPlan,
    setBookingToConfirm,
    setDurationHours,
    setIsEditMode,
    setPrompt,
    setSearchQuery,
    setShowAddDestinations,
    setStartTime,
    submitCustomPlan,
  };
}
