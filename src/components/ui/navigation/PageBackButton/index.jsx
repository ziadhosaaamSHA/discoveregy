import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton } from "../../actions/IconButton";
import { useLanguage } from "../../../../context/LanguageContext";

// Standard chevron back button for protected page headers.
export function PageBackButton({ onClick, label, className = "" }) {
  const { isRTL, t } = useLanguage();

  return (
    <IconButton
      type="button"
      label={label || t("common.goBack")}
      onClick={onClick}
      className={`p-3 bg-white/50 hover:bg-white rounded-2xl shadow-sm ${className}`}
    >
      {isRTL ? <ChevronRight size={32} /> : <ChevronLeft size={32} />}
    </IconButton>
  );
}
