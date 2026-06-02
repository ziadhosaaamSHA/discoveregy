import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronLeft, Loader2, CheckCircle2, Trash2, Plus, X, MapPin } from "lucide-react";
import { useLanguage } from "../../../../context/LanguageContext";
import * as createPlanBackend from "./backend/createPlanBackend";
import GeneratedPlans from "./components/GeneratedPlans";
import EditPlan from "./components/EditPlan";
import { SectionHeader } from "../../../../components/common/SectionHeader";
import { Modal } from "../../../../components/common/Modal";

function parseBookingDateTime(dateValue, timeValue) {
  const parsedDate = String(dateValue || "").trim();
  const parsedTime = String(timeValue || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(parsedDate)) return null;
  if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(parsedTime)) return null;
  const result = new Date(`${parsedDate}T${parsedTime}:00`);
  return Number.isNaN(result.getTime()) ? null : result;
}

function findIdRecursive(obj, seen = new Set()) {
  if (!obj || typeof obj !== "object" || seen.has(obj)) return null;
  seen.add(obj);

  const keys = ["id", "tripId", "bookingId", "value", "data", "result", "trip", "booking"];
  for (const key of keys) {
    const val = obj[key];
    if (val !== undefined && val !== null) {
      if (typeof val === "number") return val;
      if (typeof val === "string" && /^\d+$/.test(val)) return Number(val);
      if (typeof val === "object") {
        const nested = findIdRecursive(val, seen);
        if (nested !== null) return nested;
      }
    }
  }

  for (const key in obj) {
    if (!keys.includes(key)) {
      const found = findIdRecursive(obj[key], seen);
      if (found !== null) return found;
    }
  }
  return null;
}

function extractTripId(payload) {
  if (typeof payload === "number") return payload;
  if (typeof payload === "string" && /^\d+$/.test(payload)) return Number(payload);
  return findIdRecursive(payload);
}

function extractBookingId(payload) {
  if (typeof payload === "number") return payload;
  if (typeof payload === "string" && /^\d+$/.test(payload)) return Number(payload);
  return findIdRecursive(payload);
}

function mapPaymentMethod(value) {
  const normalized = String(value || "").toLowerCase();
  return normalized === "visa" ? "Visa" : "Cash";
}

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
  const [bookingStatus, setBookingStatus] = useState({ isOpen: false, isSuccess: false, message: "" });
  const [destinations, setDestinations] = useState(() => []);
  
  // Customizations for the selected plan
  const [customDestinations, setCustomDestinations] = useState([]);
  const [showAddDestinations, setShowAddDestinations] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [startTime, setStartTime] = useState(() => {
    try {
      const savedStartTime = String(JSON.parse(localStorage.getItem("user_booking_info") || "{}")?.startTime || "");
      return /^([01]\d|2[0-3]):([0-5]\d)$/.test(savedStartTime) ? savedStartTime : "";
    } catch {
      return "";
    }
  });
  const [durationHours, setDurationHours] = useState(() => {
    try {
      const savedDuration = Number(JSON.parse(localStorage.getItem("user_booking_info") || "{}")?.durationHours);
      return Number.isInteger(savedDuration) && savedDuration > 0 ? String(savedDuration) : "";
    } catch {
      return "";
    }
  });
  const bookingInfo = useMemo(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem("user_booking_info") || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }, []);
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
        destinations: customDestinations.map(d => d.id)
      };

      localStorage.setItem("current_booking_plan", JSON.stringify(planData));
      localStorage.setItem(
        "user_booking_info",
        JSON.stringify({
          ...bookingInfo,
          startTime,
          durationHours: parsedDurationHours,
        })
      );

      const bookingResponse = await createPlanBackend.createBooking({
        planId: createdTripId,
        guideId: null,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        numberOfPeople: Number(bookingInfo.numberOfPeople || 1),
        paymentMethod: mapPaymentMethod(bookingInfo.paymentMethod),
        usePoints: false,
      });

      const bookingId = extractBookingId(bookingResponse);
      if (bookingId) {
        localStorage.setItem("current_booking_id", String(bookingId));
        if (mapPaymentMethod(bookingInfo.paymentMethod) === "Visa") {
          await createPlanBackend.payBooking({ bookingId });
        }
      }

      setBookingStatus({
        isOpen: true,
        isSuccess: true,
        message: t("booking.confirmedTitle") || "Booking confirmed.",
      });
    } catch (error) {
      setBookingStatus({
        isOpen: true,
        isSuccess: false,
        message: error?.message || "Booking failed. Please try again.",
      });
    } finally {
      setIsSubmittingPlan(false);
    }
  };
  const isDurationFilled = durationHours !== '' && durationHours !== null && durationHours !== undefined;
  return (
    <div className="min-h-screen bg-[#ead9c5] text-black font-sans pb-20" dir={isRTL ? "rtl" : "ltr"}>
      <header className="p-6">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="hover:opacity-70 transition-opacity">
            {isRTL ? <ChevronLeft size={28} className="rotate-180" /> : <ChevronLeft size={28} />}
          </button>
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
          <GeneratedPlans generatedPlans={generatedPlans} onSelectPlan={handleSelectPlan} isRTL={isRTL} language={language} prompt={prompt} t={t} />
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
      <Modal
        isOpen={bookingStatus.isOpen}
        onClose={() => {
          const shouldNavigate = bookingStatus.isSuccess;
          setBookingStatus({ isOpen: false, isSuccess: false, message: "" });
          if (shouldNavigate) navigate("/tourist/home");
        }}
        title={bookingStatus.isSuccess ? (t("booking.confirmedTitle") || "Booking confirmed") : "Booking failed"}
        maxWidth="max-w-md"
      >
        <p className={`text-lg mb-8 ${bookingStatus.isSuccess ? "text-gray-700" : "text-red-700"}`}>
          {bookingStatus.message}
        </p>
        <button
          type="button"
          onClick={() => {
            const shouldNavigate = bookingStatus.isSuccess;
            setBookingStatus({ isOpen: false, isSuccess: false, message: "" });
            if (shouldNavigate) navigate("/tourist/home");
          }}
          className="w-full py-3 rounded-xl bg-[#e67e22] text-white font-bold hover:brightness-110 transition-all"
        >
          {t("booking.done") || "Done"}
        </button>
      </Modal>
    </div>
  );
}
