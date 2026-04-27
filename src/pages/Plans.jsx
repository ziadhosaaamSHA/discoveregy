import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, PlusCircle, CheckCircle2, MapPin, Sparkles } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { DESTINATIONS } from "../data/destinations";

export default function Plans() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isRTL, language, t } = useLanguage();

  const queryParams = new URLSearchParams(location.search);
  const destId = queryParams.get("destId") ? Number(queryParams.get("destId")) : null;
  const contextDest = destId ? DESTINATIONS.find(d => d.id === destId) : null;

  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [duration, setDuration] = useState("");
  const [startTime, setStartTime] = useState("");

  const PRESET_PLANS = [
    {
      id: "p1",
      title: { en: "The Eternal Wonders", ar: "عجائب الخلود" },
      destinations: [8, 1, 10, 7], // Pyramids, Luxor Temple, Valley of Kings, Karnak
      image: DESTINATIONS.find(d => d.id === 8).image,
    },
    {
      id: "p2",
      title: { en: "Coastal Escape", ar: "هروب ساحلي" },
      destinations: [6, 9, 12, 3], // Red Sea, Dahab, Sharm, Alex
      image: DESTINATIONS.find(d => d.id === 6).image,
    },
    {
      id: "p3",
      title: { en: "Spirit of Old Cairo", ar: "روح القاهرة القديمة" },
      destinations: [5, 13, 15], // Old Cairo, Khan Khalili, Citadel
      image: DESTINATIONS.find(d => d.id === 5).image,
    },
    {
      id: "p4",
      title: { en: "Desert & Oasis Journey", ar: "رحلة الصحراء والواحة" },
      destinations: [4, 14, 11], // Siwa, White Desert, Abu Simbel
      image: DESTINATIONS.find(d => d.id === 4).image,
    }
  ];

  // Auto-select plan containing the destination if provided
  useEffect(() => {
    if (destId) {
      const matchingPlan = PRESET_PLANS.find(p => p.destinations.includes(destId));
      if (matchingPlan) {
        setSelectedPlanId(matchingPlan.id);
      }
    }
  }, [destId]);

  const handleSubmit = () => {
    if (!selectedPlanId) {
      alert(t("validation.selectPlanFirst"));
      return;
    }

    if (!day || !month || !year || !duration || !startTime) {
      alert(t("validation.fillAllFields"));
      return;
    }
    
    const selectedPlan = PRESET_PLANS.find(p => p.id === selectedPlanId);
    const planData = {
      planId: selectedPlanId,
      title: selectedPlan.title[language] || selectedPlan.title.en,
      date: `${day}/${month}/${year}`,
      duration,
      startTime
    };
    
    localStorage.setItem("current_booking_plan", JSON.stringify(planData));
    navigate("/available-guides");
  };

  return (
    <div className="min-h-screen bg-[#ead9c5] px-4 py-5 text-black font-sans pb-20" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="flex items-center justify-between mb-8 max-w-6xl mx-auto relative px-2 pt-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="hover:opacity-70 transition-opacity">
            {isRTL ? <ChevronLeft size={28} strokeWidth={1.5} className="rotate-180" /> : <ChevronLeft size={28} strokeWidth={1.5} />}
          </button>
          <h1 className="text-3xl font-black tracking-tight">{t("plans.title")}</h1>
        </div>
        <button onClick={() => navigate("/create-plan")} className="bg-[#e67e22] text-white px-6 py-2 rounded-full flex items-center gap-2 font-bold shadow-md hover:brightness-110 active:scale-95 transition-all">
          <PlusCircle size={20} />
          {t("createPlan.title")}
        </button>
      </header>

      {contextDest && (
        <div className="max-w-6xl mx-auto mb-10 px-2 animate-in fade-in slide-in-from-top-4 duration-700">
           <div className="bg-[#e67e22]/10 border border-[#e67e22]/20 rounded-[30px] p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm">
              <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
                 <img src={contextDest.image} className="w-full h-full object-cover" alt="context" />
              </div>
              <div className="flex-1 text-center md:text-start">
                 <div className={`flex items-center gap-2 mb-1 justify-center md:justify-start ${isRTL ? "flex-row-reverse" : ""}`}>
                    <Sparkles size={18} className="text-[#e67e22]" />
                    <span className="text-[#e67e22] font-black uppercase tracking-widest text-xs">{t("plans.recommendedFor")}</span>
                 </div>
                 <h2 className="text-2xl font-black text-[#5d4037]">
                    {contextDest.copy[language]?.name || contextDest.copy.en.name}
                 </h2>
              </div>
              <div className="hidden lg:block h-12 w-[1px] bg-[#5d4037]/10" />
              <p className="text-sm font-medium text-black/60 max-w-sm text-center md:text-start italic">
                 {t("plans.recommendedDesc")}
              </p>
           </div>
        </div>
      )}

      {/* Grid */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-16 px-2">
        {PRESET_PLANS.map((plan) => (
          <div 
            key={plan.id} 
            className="flex flex-col gap-4 cursor-pointer group"
            onClick={() => setSelectedPlanId(plan.id)}
          >
            {/* Main Plan Image */}
            <div className={`relative w-full h-[320px] rounded-[40px] overflow-hidden shadow-xl border-4 transition-all duration-300 ${
              selectedPlanId === plan.id ? "border-[#e67e22] scale-[1.01]" : "border-transparent"
            }`}>
              <img 
                src={plan.image} 
                alt={plan.title.en} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              <div className={`absolute top-6 ${isRTL ? "left-6" : "right-6"} w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                selectedPlanId === plan.id ? "bg-[#e67e22] text-white" : "bg-white/40 backdrop-blur-md text-transparent"
              }`}>
                <CheckCircle2 size={32} />
              </div>

              <div className={`absolute bottom-6 ${isRTL ? "right-8 text-right" : "left-8 text-left"}`}>
                <h3 className="text-3xl font-black text-white drop-shadow-md">{plan.title[language] || plan.title.en}</h3>
                <div className={`flex items-center gap-2 text-white/80 mt-1 font-bold`}>
                   <MapPin size={16} />
                   <span>{plan.destinations.length} {t("plans.destinationsCount")}</span>
                </div>
              </div>
            </div>

            {/* Destinations Mini Gallery (Compact) */}
            {!selectedPlanId || selectedPlanId !== plan.id ? (
              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none px-2 mt-2">
                {plan.destinations.map(destId => {
                  const dest = DESTINATIONS.find(d => d.id === destId);
                  return (
                    <div key={destId} className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 border-white/50 shadow-sm">
                      <img src={dest.image} alt="dest" className="w-full h-full object-cover" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col gap-3 px-4 mt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                 <h4 className="text-xs font-black text-[#e67e22] uppercase tracking-widest mb-1">{t("createPlan.selectedStops")}</h4>
                 <div className="space-y-3">
                    {plan.destinations.map(destId => {
                      const dest = DESTINATIONS.find(d => d.id === destId);
                      const dInfo = dest.copy[language] || dest.copy.en;
                      return (
                        <div key={destId} className="flex items-center gap-4 bg-white/50 p-3 rounded-2xl border border-white/80">
                           <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                              <img src={dest.image} alt={dInfo.name} className="w-full h-full object-cover" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-800 truncate">{dInfo.name}</p>
                              <p className="text-[10px] font-black text-[#e67e22] uppercase">{dInfo.location}</p>
                           </div>
                        </div>
                      );
                    })}
                 </div>
              </div>
            )}
          </div>
        ))}
      </main>

      {/* Bottom Settings */}
      <div className="mt-20 max-w-6xl mx-auto px-2">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 bg-black/5 p-8 rounded-[40px] border border-black/5 shadow-inner">
          <div className="flex flex-wrap gap-8 items-center justify-center lg:justify-start">
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <span className="text-[#e67e22] text-lg font-black uppercase tracking-wider">{t("createPlan.dateLabel")}</span>
              <div className="flex gap-2">
                <input type="text" value={day} onChange={e => setDay(e.target.value)} placeholder={t("createPlan.dayPlaceholder")} className="w-full sm:w-16 bg-white rounded-xl px-2 py-3 border-none outline-none shadow-sm text-center font-bold" />
                <input type="text" value={month} onChange={e => setMonth(e.target.value)} placeholder={t("createPlan.monthPlaceholder")} className="w-full sm:w-20 bg-white rounded-xl px-2 py-3 border-none outline-none shadow-sm text-center font-bold" />
                <input type="text" value={year} onChange={e => setYear(e.target.value)} placeholder={t("createPlan.yearPlaceholder")} className="w-full sm:w-24 bg-white rounded-xl px-2 py-3 border-none outline-none shadow-sm text-center font-bold" />
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <span className="text-[#e67e22] text-lg font-black uppercase tracking-wider">{t("createPlan.durationLabel")}</span>
              <input type="text" value={duration} onChange={e => setDuration(e.target.value)} placeholder={t("createPlan.durationPlaceholder")} className="w-full sm:w-40 bg-white rounded-xl px-4 py-3 border-none outline-none shadow-sm font-bold" />
            </div>
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <span className="text-[#e67e22] text-lg font-black uppercase tracking-wider">{t("createPlan.startTimeLabel")}</span>
              <input type="text" value={startTime} onChange={e => setStartTime(e.target.value)} placeholder={t("createPlan.startTimePlaceholder")} className="w-full sm:w-40 bg-white rounded-xl px-4 py-3 border-none outline-none shadow-sm font-bold" />
            </div>
          </div>
          <button 
            onClick={handleSubmit}
            className="bg-[#e67e22] text-white px-12 py-5 rounded-3xl text-2xl font-black shadow-xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 whitespace-nowrap mt-4 lg:mt-0"
          >
            {t("createPlan.submit")}
          </button>
        </div>
      </div>
    </div>
  );
}
