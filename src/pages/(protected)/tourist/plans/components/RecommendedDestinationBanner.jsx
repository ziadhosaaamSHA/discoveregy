import { Sparkles } from "lucide-react";
import { resolveApiAssetUrl } from "@/services/api-client"

const baseUrl = "https://tourism-api-sha-e7g5guagcdc2dddv.westeurope-01.azurewebsites.net";
// RecommendedDestinationBanner explains when plans are filtered by a destination context.
export function RecommendedDestinationBanner({ destination, language, isRTL, t }) {
  if (!destination) return null;

  return (
    <div className="max-w-6xl mx-auto mb-10 px-2 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="bg-[#e67e22]/10 border border-[#e67e22]/20 rounded-[30px] p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm">
        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
          <img src={baseUrl + destination.image} className="w-full h-full object-cover" alt="context" />
        </div>
        <div className="flex-1 text-center md:text-start">
          <div className={`flex items-center gap-2 mb-1 justify-center md:justify-start ${isRTL ? "flex-row-reverse" : ""}`}>
            <Sparkles size={18} className="text-[#e67e22]" />
            <span className="text-[#e67e22] font-black uppercase tracking-widest text-xs">{t("plans.recommendedFor")}</span>
          </div>
          <h2 className="text-2xl font-black text-[#5d4037]">
            {destination.copy[language]?.name || destination.copy.en.name}
          </h2>
        </div>
        <div className="hidden lg:block h-12 w-[1px] bg-[#5d4037]/10" />
        <p className="text-sm font-medium text-black/60 max-w-sm text-center md:text-start italic">
          {t("plans.recommendedDesc")}
        </p>
      </div>
    </div>
  );
}
