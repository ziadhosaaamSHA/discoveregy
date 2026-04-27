import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronLeft, Loader2, CheckCircle2, Trash2, Plus, X, MapPin } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { generateTravelPlan } from "../services/ai";
import { DESTINATIONS } from "../data/destinations";
import { SectionHeader } from "../components/common/SectionHeader";

export default function CreatePlan() {
  const navigate = useNavigate();
  const { isRTL, language, t } = useLanguage();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlans, setGeneratedPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Customizations for the selected plan
  const [customDestinations, setCustomDestinations] = useState([]);
  const [showAddDestinations, setShowAddDestinations] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form states
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [duration, setDuration] = useState("");
  const [startTime, setStartTime] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const plans = await generateTravelPlan(prompt, language);
      setGeneratedPlans(plans);
      setSelectedPlanId(null);
      setIsEditMode(false);
    } catch (err) {
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
    return DESTINATIONS.filter(d => {
      const name = d.copy[language]?.name || d.copy.en.name;
      return name.toLowerCase().includes(searchQuery.toLowerCase()) && 
             !customDestinations.find(cd => cd.id === d.id);
    });
  }, [searchQuery, customDestinations, language]);

  const handleSubmit = () => {
    if (!selectedPlanId) {
      alert(t("validation.selectPlanFirst"));
      return;
    }

    if (!day || !month || !year || !duration || !startTime) {
      alert(t("validation.fillAllFields"));
      return;
    }

    if (customDestinations.length === 0) {
      alert(t("createPlan.emptyStops"));
      return;
    }
    
    const planData = {
      planId: selectedPlanId,
      title: selectedPlan.title,
      date: `${day}/${month}/${year}`,
      duration,
      startTime,
      destinations: customDestinations.map(d => d.id)
    };
    
    localStorage.setItem("current_booking_plan", JSON.stringify(planData));
    navigate("/available-guides");
  };

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
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SectionHeader 
              title={t("createPlan.selectTitle")} 
              subtitle={t("createPlan.resultsFor", { query: prompt })}
              className={`!ml-2 mt-8 mb-8 ${isRTL ? "!text-right" : "!text-left"}`}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {generatedPlans.map((plan) => (
                <div 
                  key={plan.id} 
                  className="bg-white/40 backdrop-blur-sm rounded-[40px] p-6 shadow-xl border border-white/50 cursor-pointer hover:scale-[1.02] transition-all group"
                  onClick={() => handleSelectPlan(plan.id)}
                >
                   <div className="aspect-video rounded-[32px] overflow-hidden mb-6">
                     <img src={plan.image} alt={plan.title} className="w-full h-full object-cover" />
                   </div>
                   <h3 className="text-2xl font-black text-[#5d4037] mb-3">{plan.title}</h3>
                   <p className="text-gray-700 font-medium leading-relaxed italic line-clamp-4">{plan.text}</p>
                   <div className={`mt-8 flex ${isRTL ? "justify-start" : "justify-end"}`}>
                      <div className="bg-[#e67e22] text-white p-3 rounded-2xl">
                         <Plus size={24} strokeWidth={3} />
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isEditMode && selectedPlan && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h2 className="text-4xl font-black text-[#5d4037]">{selectedPlan.title}</h2>
                  <p className="text-gray-600 font-medium mt-1">{t("createPlan.resultsFor", { query: prompt })}</p>
               </div>
               <button 
                 onClick={() => setIsEditMode(false)}
                 className="bg-gray-200 p-3 rounded-full hover:bg-gray-300 transition-colors"
               >
                 <X size={24} />
               </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
               {/* Selected Destinations */}
               <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between">
                     <h4 className="text-xl font-bold uppercase tracking-widest text-[#5d4037]/50">{t("createPlan.selectedStops")}</h4>
                     <button 
                       onClick={() => setShowAddDestinations(true)}
                       className="text-[#e67e22] font-black hover:underline flex items-center gap-2"
                     >
                       <Plus size={20} strokeWidth={3} /> {t("createPlan.addPlace")}
                     </button>
                  </div>

                  <div className="max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#e67e22]/20 scrollbar-track-transparent">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       {customDestinations.map(dest => (
                         <div key={dest.id} className="relative bg-white rounded-3xl overflow-hidden shadow-md border-2 border-white group h-fit">
                           <div className="h-40 overflow-hidden">
                              <img src={dest.image} className="w-full h-full object-cover" />
                           </div>
                           <div className="p-4 flex items-center justify-between">
                              <span className="font-bold text-gray-800">{dest.copy[language]?.name || dest.copy.en.name}</span>
                              <button 
                                onClick={() => handleRemoveDest(dest.id)}
                                className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors"
                              >
                                <Trash2 size={20} />
                              </button>
                           </div>
                         </div>
                       ))}
                       {customDestinations.length === 0 && (
                         <div className="col-span-full py-12 border-4 border-dashed border-black/10 rounded-[40px] flex flex-col items-center justify-center text-gray-400">
                            <MapPin size={48} className="mb-4 opacity-20" />
                            <p className="font-bold px-6 text-center">{t("createPlan.emptyStops")}</p>
                         </div>
                       )}
                    </div>
                  </div>
               </div>

               {/* Add Destinations Modal/Panel (Simplified overlay) */}
               {showAddDestinations && (
                 <div className="fixed inset-0 z-50 bg-[#F2E0CA]/95 backdrop-blur-md flex items-center justify-center p-6" dir={isRTL ? "rtl" : "ltr"}>
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden border border-black/5">
                       <div className="p-8 border-b border-gray-100 flex items-center gap-6">
                          <Search size={28} className="text-[#e67e22]" />
                          <input 
                            autoFocus
                            type="text"
                            placeholder={t("createPlan.searchPlaceholder")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="text-2xl font-bold w-full outline-none"
                          />
                          <button onClick={() => setShowAddDestinations(false)} className="p-2 hover:bg-gray-100 rounded-full">
                            <X size={32} />
                          </button>
                       </div>
                       <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                          {filteredAvailableDestinations.map(dest => (
                            <div 
                              key={dest.id}
                              onClick={() => handleAddDest(dest)}
                              className="cursor-pointer group flex flex-col gap-3"
                            >
                               <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-sm group-hover:shadow-lg transition-all group-hover:scale-[1.02]">
                                  <img src={dest.image} className="w-full h-full object-cover" />
                               </div>
                               <span className="font-black text-gray-700 px-2">{dest.copy[language]?.name || dest.copy.en.name}</span>
                            </div>
                          ))}
                          {filteredAvailableDestinations.length === 0 && (
                             <div className="col-span-full py-20 text-center text-gray-400 font-bold">
                                {t("createPlan.noResults")}
                             </div>
                          )}
                       </div>
                    </div>
                 </div>
               )}

               {/* Booking Details Sidebar */}
               <div className="bg-[#5d4037]/5 rounded-[40px] p-6 md:p-8 border border-[#5d4037]/10 h-fit space-y-8">
                  <h4 className="text-xl font-black text-[#5d4037] uppercase tracking-widest border-b border-[#5d4037]/10 pb-4">{t("createPlan.tripDetails")}</h4>
                  
                  <div className="space-y-6">
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-black text-[#e67e22] uppercase tracking-tighter">{t("createPlan.dateLabel")}</span>
                      <div className="flex gap-2">
                        <input type="text" value={day} onChange={e => setDay(e.target.value)} placeholder={t("createPlan.dayPlaceholder")} className="min-w-0 w-full bg-white rounded-2xl px-2 py-4 border-none outline-none shadow-sm text-center font-bold text-sm" />
                        <input type="text" value={month} onChange={e => setMonth(e.target.value)} placeholder={t("createPlan.monthPlaceholder")} className="min-w-0 w-full bg-white rounded-2xl px-2 py-4 border-none outline-none shadow-sm text-center font-bold text-sm" />
                        <input type="text" value={year} onChange={e => setYear(e.target.value)} placeholder={t("createPlan.yearPlaceholder")} className="min-w-0 w-full bg-white rounded-2xl px-2 py-4 border-none outline-none shadow-sm text-center font-bold text-sm" />
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-black text-[#e67e22] uppercase tracking-tighter">{t("createPlan.durationLabel")}</span>
                      <input type="text" value={duration} onChange={e => setDuration(e.target.value)} placeholder={t("createPlan.durationPlaceholder")} className="min-w-0 w-full bg-white rounded-2xl px-4 py-4 border-none outline-none shadow-sm font-bold" />
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-black text-[#e67e22] uppercase tracking-tighter">{t("createPlan.startTimeLabel")}</span>
                      <input type="text" value={startTime} onChange={e => setStartTime(e.target.value)} placeholder={t("createPlan.startTimePlaceholder")} className="min-w-0 w-full bg-white rounded-2xl px-4 py-4 border-none outline-none shadow-sm font-bold" />
                    </div>
                  </div>

                  <button 
                    onClick={handleSubmit}
                    className="w-full bg-[#e67e22] text-white py-5 rounded-3xl text-2xl font-black shadow-xl hover:brightness-110 active:scale-95 transition-all mt-4"
                  >
                    {t("createPlan.submit")}
                  </button>
               </div>
            </div>
          </div>
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
    </div>
  );
}
