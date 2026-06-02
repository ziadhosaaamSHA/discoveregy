import { motion } from "framer-motion";
import { Check, Loader2, MessageCircle, Star } from "lucide-react";
import { IconButton } from "../../../../../components/ui";
import { useLanguage } from "../../../../../context/LanguageContext";

// GuideCard displays guide identity, rating, language tags, and quick actions.
export function GuideCard({ guide, onBook, onChat, language, isBooking = false }) {
  const { t } = useLanguage();
  const name = guide.name[language] || guide.name.en || "";
  const specialty = guide.specialty[language] || guide.specialty.en || "";
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#154d7d] rounded-[40px] p-6 shadow-xl relative overflow-hidden flex flex-col items-center text-center group border border-[#f2e0ca]/10 hover:border-[#f2e0ca]/30 transition-all"
    >
      <div className="w-28 h-28 rounded-full overflow-hidden mb-5 border-4 border-[#f2e0ca]/20 shadow-inner">
        {guide.image ? (
          <img src={guide.image} alt={name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <div className="w-full h-full bg-[#f2e0ca]/10 text-[#f2e0ca] flex items-center justify-center text-3xl font-black">
            {initials}
          </div>
        )}
      </div>

      <div className="space-y-1 mb-8">
        {name && <h3 className="text-2xl font-bold text-[#f2e0ca] tracking-tight">{name}</h3>}
        {specialty && <p className="text-[#f2e0ca]/70 font-medium text-sm">{specialty}</p>}
        {guide.rating && (
          <div className="flex items-center justify-center gap-1.5 text-[#E8A020] mt-1">
            <Star size={16} fill="#E8A020" />
            <span className="font-bold text-lg">{guide.rating}</span>
          </div>
        )}
        {guide.languages.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {guide.languages.map((lang) => (
              <span key={lang} className="px-3 py-1 bg-white/10 rounded-full text-[11px] font-semibold text-[#f2e0ca] border border-white/5">
                {lang}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-5 mt-auto w-full">
        <IconButton
          label={t("availableGuides.bookGuide")}
          onClick={() => onBook(guide)}
          disabled={isBooking}
          className="w-14 h-14 rounded-full bg-[#f2e0ca] flex items-center justify-center hover:bg-white transition-all shadow-lg active:scale-90 hover:shadow-[#f2e0ca]/20"
        >
          {isBooking ? <Loader2 size={26} className="animate-spin text-[#154d7d]" /> : <Check size={28} className="text-[#154d7d]" strokeWidth={3} />}
        </IconButton>
        <IconButton
          label={t("availableGuides.chatWithGuide")}
          onClick={() => onChat(guide)}
          className="w-14 h-14 rounded-full bg-[#f2e0ca] flex items-center justify-center hover:bg-white transition-all shadow-lg active:scale-90 hover:shadow-[#f2e0ca]/20"
        >
          <MessageCircle size={26} className="text-[#154d7d]" />
        </IconButton>
      </div>
    </motion.div>
  );
}
