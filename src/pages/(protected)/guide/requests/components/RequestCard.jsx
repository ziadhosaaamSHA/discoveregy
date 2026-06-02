import { motion } from "framer-motion";
import { Check, MessageCircle, X } from "lucide-react";
import { IconButton } from "../../../../../components/ui";
import { useLanguage } from "../../../../../context/LanguageContext";

// RequestCard summarizes a trip request and exposes accept, chat, and cancel actions.
export function RequestCard({ request, onAccept, onChat, onCancel, isAccepted = false }) {
  const { t, language } = useLanguage();
  const tripType = typeof request.tripType === "object" ? request.tripType[language] || request.tripType.en : request.tripType;
  const location = typeof request.location === "object" ? request.location[language] || request.location.en : request.location;
  const date = typeof request.date === "object" ? request.date[language] || request.date.en : request.date;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#154d7d] rounded-[32px] p-6 shadow-xl relative overflow-hidden border border-white/5 flex flex-col justify-between h-full"
    >
      <div className="space-y-3 font-medium text-[#f2e0ca] mb-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-black text-xs uppercase font-black opacity-60 mb-0.5">{t("requests.touristName")}</p>
            <p className="text-xl font-black leading-none">{request.touristName}</p>
          </div>
          {isAccepted && (
            <span className="px-3 py-1 bg-green-500/20 text-green-400 text-[10px] font-black rounded-full border border-green-500/30">
              {t("requests.accepted")}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <p className="text-black text-[10px] uppercase font-black opacity-60">{t("requests.type")}</p>
            <p className="text-sm font-bold">{tripType}</p>
          </div>
          <div>
            <p className="text-black text-[10px] uppercase font-black opacity-60">{t("requests.location")}</p>
            <p className="text-sm font-bold">{location}</p>
          </div>
          <div>
            <p className="text-black text-[10px] uppercase font-black opacity-60">{t("requests.date")}</p>
            <p className="text-sm font-bold">{date}</p>
          </div>
          <div>
            <p className="text-black text-[10px] uppercase font-black opacity-60">{t("requests.people")}</p>
            <p className="text-sm font-bold">{request.people}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 justify-end">
        {!isAccepted && (
          <IconButton
            label={t("requests.accepted")}
            onClick={() => onAccept(request.id)}
            className="w-11 h-11 rounded-full bg-[#f2e0ca] flex items-center justify-center hover:bg-white transition-all shadow-md active:scale-90"
          >
            <Check size={22} className="text-[#154d7d]" strokeWidth={3} />
          </IconButton>
        )}
        <IconButton
          label={t("chats.title")}
          onClick={() => onChat(request.conversationId)}
          className="w-11 h-11 rounded-full bg-[#f2e0ca] flex items-center justify-center hover:bg-white transition-all shadow-md active:scale-90"
        >
          <MessageCircle size={20} className="text-[#154d7d]" />
        </IconButton>
        <IconButton
          label={t("common.cancel")}
          onClick={() => onCancel(request.id, isAccepted)}
          className="w-11 h-11 rounded-full bg-[#d43e0b] flex items-center justify-center hover:brightness-110 shadow-md active:scale-90 transition-all"
        >
          <X size={20} className="text-white" strokeWidth={3} />
        </IconButton>
      </div>
    </motion.div>
  );
}
