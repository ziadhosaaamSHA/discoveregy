import { CheckCircle2, MapPin, Trash2, Wallet } from "lucide-react";
import { resolveApiAssetUrl } from "@/services/api-client";
import { formatAmount } from "./planUtils";
import { IconButton } from "../../../../../components/ui";


function DestinationPreview({ destinationMap, destinationIds }) {
  return (
    <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none px-2 mt-2">
      {destinationIds.map((destId) => {
        const dest = destinationMap.get(destId);
        if (!dest) return null;
        return (
          <div key={destId} className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 border-white/50 shadow-sm">
            <img src={resolveApiAssetUrl(dest.image)} alt="dest" className="w-full h-full object-cover" />
          </div>
        );
      })}
    </div>
  );
}

function ExpandedDestinations({ destinationMap, destinationIds, language, t }) {
  return (
    <div className="flex flex-col gap-3 px-4 mt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h4 className="text-xs font-black text-[#e67e22] uppercase tracking-widest mb-1">{t("createPlan.selectedStops")}</h4>
      <div className="space-y-3">
        {destinationIds.map((destId) => {
          const dest = destinationMap.get(destId);
          if (!dest) return null;
          const dInfo = dest.copy[language] || dest.copy.en;
          return (
            <div key={destId} className="flex items-center gap-4 bg-white/50 p-3 rounded-2xl border border-white/80">
              <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                <img src={resolveApiAssetUrl(dest.image)} alt={dInfo.name} className="w-full h-full object-cover" />
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
  );
}

// PlanCard renders one selectable trip plan and its destination preview/details.
export function PlanCard({
  plan,
  isActive,
  isRTL,
  language,
  t,
  destinationMap,
  tripDetails,
  deletingPlanId,
  onSelect,
  onDelete,
}) {
  const destinationIds = Array.isArray(tripDetails?.placeIds) ? tripDetails.placeIds : plan.destinations;

  return (
    <div className="flex flex-col gap-4 cursor-pointer group" onClick={() => onSelect(plan.id)}>
      <div className={`relative w-full h-[320px] rounded-[40px] overflow-hidden shadow-xl border-4 transition-all duration-300 ${
        isActive ? "border-[#e67e22] scale-[1.01]" : "border-transparent"
      }`}>
        {plan.image ? (
          <img
            src={resolveApiAssetUrl(plan.image)}
            alt={plan.title.en}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-[#c9ae89]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className={`absolute top-6 ${isRTL ? "left-6" : "right-6"} w-12 h-12 rounded-full flex items-center justify-center transition-all ${
          isActive ? "bg-[#e67e22] text-white" : "bg-white/40 backdrop-blur-md text-transparent"
        }`}>
          <CheckCircle2 size={32} />
        </div>
        {String(plan.id).startsWith("custom-") && (
          <IconButton
            label={t("plans.deleteTrip") || "Delete trip"}
            type="button"
            onClick={(event) => onDelete(event, plan)}
            disabled={deletingPlanId === plan.id}
            className={`absolute top-6 ${isRTL ? "right-6" : "left-6"} w-10 h-10 rounded-full flex items-center justify-center transition ${
              deletingPlanId === plan.id ? "bg-red-900/80 cursor-not-allowed" : "bg-red-600/80 hover:bg-red-700"
            }`}
          >
            <Trash2 size={18} className="text-white" />
          </IconButton>
        )}

        <div className={`absolute bottom-6 ${isRTL ? "right-8 text-right" : "left-8 text-left"}`}>
          <h3 className="text-3xl font-black text-white drop-shadow-md">{plan.title[language] || plan.title.en}</h3>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-white/90 font-bold">
            <span className="inline-flex items-center gap-2 rounded-full bg-black/35 px-3 py-1 backdrop-blur-sm">
              <MapPin size={16} />
              <span>{destinationIds.length} {t("plans.destinationsCount")}</span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#e67e22] px-3 py-1 text-white shadow-lg">
              <Wallet size={16} />
              <span>{formatAmount(plan.price, language)}</span>
            </span>
            {plan.guideName && (
              <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-sm backdrop-blur-sm">
                {plan.guideName}
              </span>
            )}
          </div>
        </div>
      </div>

      {isActive ? (
        <ExpandedDestinations destinationMap={destinationMap} destinationIds={destinationIds} language={language} t={t} />
      ) : (
        <DestinationPreview destinationMap={destinationMap} destinationIds={destinationIds} />
      )}
    </div>
  );
}
