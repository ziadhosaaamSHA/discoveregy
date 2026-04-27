import { useState } from "react";
import { motion } from "framer-motion";
import { Check, MessageCircle, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useLanguage } from "../context/LanguageContext";
import { GUIDES } from "../data/guides";
import { Modal } from "../components/common/Modal";
import { SectionHeader } from "../components/common/SectionHeader";

function GuideCard({ guide, onBook, onChat, language }) {
  const name = guide.name[language] || guide.name.en;
  const specialty = guide.specialty[language] || guide.specialty.en;
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#154d7d] rounded-[40px] p-6 shadow-xl relative overflow-hidden flex flex-col items-center text-center group border border-[#f2e0ca]/10 hover:border-[#f2e0ca]/30 transition-all"
    >
      <div className="w-28 h-28 rounded-full overflow-hidden mb-5 border-4 border-[#f2e0ca]/20 shadow-inner">
        <img src={guide.image} alt={name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
      </div>
      
      <div className="space-y-1 mb-8">
        <h3 className="text-2xl font-bold text-[#f2e0ca] tracking-tight">{name}</h3>
        <p className="text-[#f2e0ca]/70 font-medium text-sm">{specialty}</p>
        <div className="flex items-center justify-center gap-1.5 text-[#E8A020] mt-1">
          <Star size={16} fill="#E8A020" />
          <span className="font-bold text-lg">{guide.rating}</span>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {guide.languages.map(lang => (
            <span key={lang} className="px-3 py-1 bg-white/10 rounded-full text-[11px] font-semibold text-[#f2e0ca] border border-white/5">{lang}</span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-5 mt-auto w-full">
        <button
          onClick={() => onBook(guide)}
          className="w-14 h-14 rounded-full bg-[#f2e0ca] flex items-center justify-center hover:bg-white transition-all shadow-lg active:scale-90 hover:shadow-[#f2e0ca]/20"
        >
          <Check size={28} className="text-[#154d7d]" strokeWidth={3} />
        </button>
        <button
          onClick={() => onChat(guide)}
          className="w-14 h-14 rounded-full bg-[#f2e0ca] flex items-center justify-center hover:bg-white transition-all shadow-lg active:scale-90 hover:shadow-[#f2e0ca]/20"
        >
          <MessageCircle size={26} className="text-[#154d7d]" />
        </button>
      </div>
    </motion.div>
  );
}

export default function AvailableGuides() {
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const handleBook = (guide) => {
    setSelectedGuide(guide);
    const bookingPlan = JSON.parse(localStorage.getItem("current_booking_plan") || "{}");
    const upcomingTrips = JSON.parse(localStorage.getItem("upcoming_trips") || "[]");
    
    const tripTypeObj = typeof bookingPlan.title === 'string' 
      ? { [language]: bookingPlan.title, [language === 'ar' ? 'en' : 'ar']: bookingPlan.title }
      : { en: "Custom Plan", ar: "خطة مخصصة" };

    const dateObj = typeof bookingPlan.date === 'string'
      ? { [language]: bookingPlan.date, [language === 'ar' ? 'en' : 'ar']: bookingPlan.date }
      : { en: "Pending confirmation", ar: "في انتظار التأكيد" };

    upcomingTrips.push({
      id: Date.now().toString(),
      guideName: guide.name, 
      guideImage: guide.image,
      tripType: tripTypeObj,
      date: dateObj,
      conversationId: `conv-${guide.id}`
    });
    
    localStorage.setItem("upcoming_trips", JSON.stringify(upcomingTrips));
    setIsSuccessModalOpen(true);
  };

  const handleChat = (guide) => {
    navigate(`/chats/conv-${guide.id}`);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F2E0CA" }}>
      <Header />

      <main className="pt-24 pb-16 px-6">
        <div className="max-w-[1240px] mx-auto py-10">
          <div className="flex items-center gap-6 mb-12">
            <button onClick={() => navigate(-1)} className="p-3 bg-white/50 hover:bg-white rounded-2xl shadow-sm transition-all active:scale-95">
              {isRTL ? <ChevronRight size={32} /> : <ChevronLeft size={32} />}
            </button>
            <h1 className="text-5xl font-black text-black tracking-tight">
              {t("availableGuides.title")}
            </h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {GUIDES.map((guide) => (
              <GuideCard
                key={guide.id}
                guide={guide}
                onBook={handleBook}
                onChat={handleChat}
                language={language}
              />
            ))}
          </div>
        </div>
      </main>

      <Modal 
        isOpen={isSuccessModalOpen} 
        onClose={() => navigate("/home")}
        title={t("availableGuides.successTitle")}
      >
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={48} className="text-green-600" strokeWidth={3} />
        </div>
        <p className="text-gray-600 text-lg mb-8 leading-relaxed">
          {t("availableGuides.successBody", { name: selectedGuide?.name[language] || selectedGuide?.name.en })}
        </p>
        <button
          onClick={() => navigate("/home")}
          className="w-full py-5 bg-[#e67e22] text-white text-xl font-black rounded-3xl shadow-lg hover:brightness-110 active:scale-95 transition-all"
        >
          {t("availableGuides.goTrips")}
        </button>
      </Modal>

      <Footer />
    </div>
  );
}
