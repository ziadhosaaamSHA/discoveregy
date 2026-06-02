import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronLeft, Loader2, Plus, Check, XCircle } from "lucide-react";
import { useLanguage } from "../../../../context/LanguageContext";
import { motion } from "framer-motion";
import * as createPlanBackend from "./backend/createPlanBackend";
import GeneratedPlans from "./components/GeneratedPlans";
import EditPlan from "./components/EditPlan";
import { formatAmount } from "../../../../shared/utils/money";
import { Modal, PaymentConfirmationModal } from "../../../../components/ui";
import {
  clearCurrentBookingId,
  clearSelectedGuide,
  getSavedDurationHours,
  getSavedStartTime,
  mergeBookingInfo,
  readBookingInfo,
  saveCurrentBookingPlan,
} from "../../../../services/booking-session";
import { extractTripId } from "../../../../services/mappers/booking.mapper";
import { readTicketPrice } from "../../../../services/mappers/place.mapper";
import { parseBookingDateTime } from "../../../../shared/utils/dates";

function createTimeOptions() {
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

const TIME_OPTIONS = createTimeOptions();

// CreatePlan builds a custom travel plan from selected destinations and trip timing.
export default function CreatePlan() {
  const navigate = useNavigate();
  const { isRTL, language, t } = useLanguage();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlans, setGeneratedPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmittingPlan, setIsSubmittingPlan] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ isOpen: false, isSuccess: false, message: "" });
  const [bookingToConfirm, setBookingToConfirm] = useState(null);
  const [destinations, setDestinations] = useState(() => []);
  
  // Customizations for the selected plan
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

  const handleGenerate = async () => {
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

  const selectedPlan = useMemo(() => 
    generatedPlans.find(p => p.id === selectedPlanId), 
  [generatedPlans, selectedPlanId]);

  const handleSelectPlan = (id) => {
    setSelectedPlanId(id);
    const plan = generatedPlans.find(p => p.id === id);
    setCustomDestinations(plan.destinations || []); 
    setIsEditMode(true);
  };

  const handleRemoveDest = (id) => {
    setCustomDestinations(prev => prev.filter(d => d.id !== id));
  };

  const handleAddDest = (dest) => {
    if (!customDestinations.find(d => d.id === dest.id)) {
      setCustomDestinations(prev => [...prev, dest]);
    }
    setShowAddDestinations(false);
  };

  const filteredAvailableDestinations = useMemo(() => {
    return destinations.filter(d => {
      const name = d.copy[language]?.name || d.copy.en.name;
      return name.toLowerCase().includes(searchQuery.toLowerCase()) && 
             !customDestinations.find(cd => cd.id === d.id);
    });
  }, [searchQuery, customDestinations, language, destinations]);

  const customPlanAmount = useMemo(
    () => customDestinations.reduce((sum, destination) => sum + readTicketPrice(destination), 0),
    [customDestinations]
  );

  const handleSubmit = async () => {
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
        console.error("Trip creation response:", response);
        throw new Error("Trip created successfully, but could not resolve trip ID. Please check your trips in the Plans section.");
      }

      const planData = {
        planId: selectedPlanId,
        tripId: createdTripId,
        title: selectedPlan.title,
        date: bookingDate,
        duration: `${parsedDurationHours}h`,
        startTime,
        destinations: customDestinations.map(d => d.id),
        destinationIds: customDestinations.map(d => d.id),
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
  const isDurationFilled = durationHours !== '' && durationHours !== null && durationHours !== undefined;
  return (
    <div className="min-h-screen bg-[#ead9c5] text-black font-sans pb-20" dir={isRTL ? "rtl" : "ltr"}>
      <header className="max-w-7xl mx-auto px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="hover:opacity-70 transition-opacity" aria-label="Go Back">
              {isRTL ? <ChevronLeft size={28} strokeWidth={1.5} className="rotate-180" /> : <ChevronLeft size={28} strokeWidth={1.5} />}
            </button>
            <h1 className="text-3xl font-black tracking-tight">{t("createPlan.title") || "Create Plan"}</h1>
          </div>
          <img src="/images/DiscoverEgyptLogo.png" alt="Discover Egypt" className="h-16 w-auto" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6">
        <div className="relative mb-12">
          <div className="bg-[#dcd0bf] rounded-3xl flex items-center px-6 py-5 shadow-inner border border-black/5 group focus-within:ring-2 ring-[#e67e22]/30 transition-all">
            <Search className={isRTL ? "ml-4" : "mr-4"} size={26} style={{ color: "#5d4037" }} />
            <input 
              type="text" 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder={t("createPlan.placeholder")}
              className="bg-transparent border-none outline-none text-2xl text-gray-800 w-full font-black placeholder-gray-500"
            />
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`${isRTL ? "mr-4" : "ml-4"} bg-[#e67e22] text-white px-8 py-3 rounded-2xl font-black text-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 min-w-[140px] shadow-lg`}
            >
              {isGenerating ? <Loader2 className="animate-spin mx-auto" /> : t("createPlan.generate")}
            </button>
          </div>
        </div>

        {generatedPlans.length > 0 && !isEditMode && (
          <GeneratedPlans generatedPlans={generatedPlans} onSelectPlan={handleSelectPlan} isRTL={isRTL} prompt={prompt} t={t} />
        )}

        {isEditMode && selectedPlan && (
          <EditPlan
            selectedPlan={selectedPlan}
            setIsEditMode={setIsEditMode}
            isRTL={isRTL}
            language={language}
            t={t}
            customDestinations={customDestinations}
            handleRemoveDest={handleRemoveDest}
            setShowAddDestinations={setShowAddDestinations}
            showAddDestinations={showAddDestinations}
            filteredAvailableDestinations={filteredAvailableDestinations}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleAddDest={handleAddDest}
            bookingDate={bookingDate}
            TIME_OPTIONS={TIME_OPTIONS}
            startTime={startTime}
            setStartTime={setStartTime}
            durationHours={durationHours}
            setDurationHours={setDurationHours}
            isDurationFilled={isDurationFilled}
            navigate={navigate}
            handleSubmit={handleSubmit}
            isSubmittingPlan={isSubmittingPlan}
            hasValidBookingDetails={hasValidBookingDetails}
            customPlanAmount={customPlanAmount}
          />
        )}

        {!generatedPlans.length && (
          <div className="py-32 text-center animate-in fade-in duration-1000">
            <div className="mb-8 flex justify-center">
               <div className="w-32 h-32 bg-white/30 rounded-full flex items-center justify-center border-4 border-white/50">
                  <Plus size={64} className="text-white opacity-50" />
               </div>
            </div>
            <p className="text-3xl font-black text-white/50 italic max-w-2xl mx-auto leading-relaxed">
              {t("createPlan.emptyState")}
            </p>
          </div>
        )}
      </main>
      <PaymentConfirmationModal
        isOpen={!!bookingToConfirm}
        onClose={() => setBookingToConfirm(null)}
        title={t("booking.confirmPaymentTitle") || "Confirm Payment"}
        itemTitle={bookingToConfirm?.selectedPlan.title || ""}
        subtitle={`${customDestinations.length} ${language === "ar" ? "أماكن" : "places"}`}
        amountLabel={t("booking.amountDue")}
        amount={bookingToConfirm ? formatAmount(bookingToConfirm.amount, language) : ""}
        details={[
          { label: t("createPlan.dateLabel") || "Date", value: bookingDate },
          { label: t("createPlan.startTimeLabel") || "Time", value: startTime },
          { label: t("createPlan.durationLabel") || "Duration", value: `${parsedDurationHours} ${t("createPlan.hours")}` },
        ]}
        message={
          bookingToConfirm
            ? t("booking.confirmPaymentBody", { amount: formatAmount(bookingToConfirm.amount, language) })
            : ""
        }
        cancelLabel={t("common.cancel")}
        confirmLabel={t("booking.confirmAndPay")}
        loadingLabel={t("booking.submitting")}
        isLoading={isSubmittingPlan}
        isRTL={isRTL}
        onConfirm={confirmCustomPlan}
      />
      <Modal
        isOpen={saveStatus.isOpen}
        onClose={() => {
          const shouldNavigate = saveStatus.isSuccess;
          setSaveStatus({ isOpen: false, isSuccess: false, message: "" });
          if (shouldNavigate) navigate("/tourist/available-guides?mode=custom");
        }}
        title=""
        maxWidth="max-w-md"
      >
        <div className="flex flex-col items-center text-center p-4">
          {saveStatus.isSuccess ? (
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 border-4 border-green-100"
            >
              <Check size={40} className="text-green-600" strokeWidth={3} />
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0, rotate: 45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 border-4 border-red-100"
            >
              <XCircle size={40} className="text-red-600" strokeWidth={2} />
            </motion.div>
          )}

          <h3 className="text-2xl font-black text-gray-800 mb-2">
            {saveStatus.isSuccess 
              ? (t("createPlan.planSavedTitle") || "Plan Saved!") 
              : (t("createPlan.planSaveFailed") || "Plan Save Failed")}
          </h3>

          <p className={`text-sm font-semibold mb-8 leading-relaxed max-w-[280px] ${saveStatus.isSuccess ? "text-gray-500" : "text-red-600"}`}>
            {saveStatus.message}
          </p>

          <button
            type="button"
            onClick={() => {
              const shouldNavigate = saveStatus.isSuccess;
              setSaveStatus({ isOpen: false, isSuccess: false, message: "" });
              if (shouldNavigate) navigate("/tourist/available-guides?mode=custom");
            }}
            className="w-full py-4 rounded-2xl bg-[#e67e22] text-white font-black hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#e67e22]/20"
          >
            {saveStatus.isSuccess ? (t("availableGuides.title") || "Available Tour Guides") : (t("booking.done") || "Done")}
          </button>
        </div>
      </Modal>
    </div>
  );
}
