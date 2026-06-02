import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Button, IconButton } from "../../../../../components/ui";
import { useLanguage } from "../../../../../context/LanguageContext";

// SuccessModal confirms booking completion before moving the user onward.
export function SuccessModal({ onClose }) {
  const { t } = useLanguage();

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative z-10 w-full max-w-sm rounded-[28px] p-8 flex flex-col items-center gap-5 text-center"
        style={{
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.2)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        }}
      >
        <IconButton
          label={t("common.close")}
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
        >
          <X size={16} />
        </IconButton>
        <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #E8A020 0%, #d4901a 100%)" }}>
          <Check size={36} className="text-white" strokeWidth={3} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white tracking-tight">{t("booking.confirmedTitle")}</h2>
          <p className="text-gray-300 text-[14px] leading-relaxed">{t("booking.contactSoon")}</p>
        </div>
        <Button
          type="button"
          fullWidth
          onClick={onClose}
        >
          {t("booking.done")}
        </Button>
      </motion.div>
    </motion.div>
  );
}
