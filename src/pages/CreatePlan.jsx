import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronLeft, Loader2, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { generateTravelPlan } from "../services/ai";
import { SectionHeader } from "../components/common/SectionHeader";

export default function CreatePlan() {
  const navigate = useNavigate();
  const { isRTL, language, t } = useLanguage();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlans, setGeneratedPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  
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
    } catch (err) {
      alert("Error generating plan. Please check your connection or token.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = () => {
    if (!selectedPlanId) {
      alert("Please select a plan first!");
      return;
    }
    
    const selectedPlan = generatedPlans.find(p => p.id === selectedPlanId);
    const planData = {
      planId: selectedPlanId,
      title: selectedPlan.title,
      date: `${day}/${month}/${year}`,
      duration,
      startTime
    };
    
    localStorage.setItem("current_booking_plan", JSON.stringify(planData));
    navigate("/available-guides");
  };

  return (
    <div className="min-h-screen bg-[#ead9c5] text-black font-sans pb-10" style={{ direction: isRTL ? "rtl" : "ltr" }}>
      <header className="p-6">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="hover:opacity-70 transition-opacity">
            {isRTL ? <ChevronLeft size={28} className="rotate-180" /> : <ChevronLeft size={28} />}
          </button>
          <img src="/images/DiscoverEgyptLogo.png" alt="Discover Egypt" className="h-16 w-auto" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6">
        <div className="relative mb-4">
          <div className="bg-[#dcd0bf] rounded-2xl flex items-center px-6 py-4 shadow-sm group focus-within:ring-2 ring-[#e67e22]/30 transition-all">
            <Search className={isRTL ? "text-gray-600 ml-4" : "text-gray-600 mr-4"} size={24} />
            <input 
              type="text" 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder={t("createPlan.placeholder")}
              className="bg-transparent border-none outline-none text-xl text-gray-800 w-full font-medium placeholder-gray-500"
            />
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`${isRTL ? "mr-4" : "ml-4"} bg-[#e67e22] text-white px-6 py-2 rounded-xl font-bold hover:brightness-110 transition-all disabled:opacity-50 min-w-[120px]`}
            >
              {isGenerating ? <Loader2 className="animate-spin mx-auto" /> : t("createPlan.generate")}
            </button>
          </div>
        </div>

        {generatedPlans.length > 0 ? (
          <>
            <SectionHeader 
              title={t("createPlan.selectTitle")} 
              subtitle={t("createPlan.resultsFor", { query: prompt })}
              className={`!ml-2 mt-8 mb-6 ${isRTL ? "!text-right" : "!text-left"}`}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {generatedPlans.map((place) => (
                <div 
                  key={place.id} 
                  className="flex flex-col cursor-pointer group"
                  onClick={() => setSelectedPlanId(place.id)}
                >
                  <div className={`relative aspect-[4/5] rounded-3xl overflow-hidden shadow-md transition-all duration-300 border-4 ${
                    selectedPlanId === place.id ? "border-[#e67e22] scale-[1.02]" : "border-transparent"
                  }`}>
                    <img src={place.image} alt={place.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className={`absolute top-4 ${isRTL ? "left-4" : "right-4"} w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      selectedPlanId === place.id ? "bg-[#e67e22] text-white" : "bg-white/50 backdrop-blur-sm text-transparent"
                    }`}>
                      <CheckCircle2 size={24} />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-center mt-3 mb-1 capitalize text-[#5d4037]">{place.title}</h3>
                  <p className="text-[13px] leading-snug font-medium text-gray-700 px-1 line-clamp-3">{place.text}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="py-20 text-center">
            <p className="text-xl font-medium text-gray-600 italic">
              {t("createPlan.emptyState")}
            </p>
          </div>
        )}

        <div className="mt-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 bg-transparent max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-8 items-center">
            <div className="flex items-center gap-4">
              <span className="text-[#e67e22] text-2xl font-bold">{t("createPlan.dateLabel")}</span>
              <div className="flex gap-2">
                <input type="text" value={day} onChange={e => setDay(e.target.value)} placeholder={t("createPlan.dayPlaceholder")} className="w-20 bg-white/70 rounded-xl px-4 py-2 border-none outline-none shadow-inner text-sm italic" />
                <input type="text" value={month} onChange={e => setMonth(e.target.value)} placeholder={t("createPlan.monthPlaceholder")} className="w-20 bg-white/70 rounded-xl px-4 py-2 border-none outline-none shadow-inner text-sm italic" />
                <input type="text" value={year} onChange={e => setYear(e.target.value)} placeholder={t("createPlan.yearPlaceholder")} className="w-20 bg-white/70 rounded-xl px-4 py-2 border-none outline-none shadow-inner text-sm italic" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[#e67e22] text-2xl font-bold">{t("createPlan.durationLabel")}</span>
              <input type="text" value={duration} onChange={e => setDuration(e.target.value)} placeholder={t("createPlan.durationPlaceholder")} className="w-32 bg-white/70 rounded-xl px-4 py-2 border-none outline-none shadow-inner" />
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <span className="text-[#e67e22] text-2xl font-bold">{t("createPlan.startTimeLabel")}</span>
              <input type="text" value={startTime} onChange={e => setStartTime(e.target.value)} placeholder={t("createPlan.startTimePlaceholder")} className="w-32 bg-white/70 rounded-xl px-4 py-2 border-none outline-none shadow-inner" />
            </div>
          </div>
          <button 
            onClick={handleSubmit}
            className="bg-[#e67e22] text-white px-12 py-3 rounded-2xl text-2xl font-black shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
          >
            {t("createPlan.submit")}
          </button>
        </div>
      </main>
    </div>
  );
}
