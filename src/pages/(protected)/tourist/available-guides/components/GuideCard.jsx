import { motion } from "framer-motion";
import { Check, MessageCircle, Star } from "lucide-react";

// GuideCard displays guide identity, rating, language tags, and quick actions.
export function GuideCard({ guide, onBook, onChat, language }) {
  const name = guide.name[language] || guide.name.en;
  const specialty = guide.specialty[language] || guide.specialty.en;

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
          {guide.languages.map((lang) => (
            <span key={lang} className="px-3 py-1 bg-white/10 rounded-full text-[11px] font-semibold text-[#f2e0ca] border border-white/5">
              {lang}
            </span>
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
