import { ChevronLeft, PlusCircle } from "lucide-react";

// PlansHeader keeps page-level navigation separate from plan selection state.
export function PlansHeader({
  isRTL,
  navigate,
  title,
  createLabel,
  destId,
  activeTab,
  setActiveTab,
  t,
  language,
}) {
  return (
    <header className="flex flex-col gap-6 mb-8 max-w-6xl mx-auto px-2 pt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="hover:opacity-70 transition-opacity" aria-label="Go Back">
            {isRTL ? <ChevronLeft size={28} strokeWidth={1.5} className="rotate-180" /> : <ChevronLeft size={28} strokeWidth={1.5} />}
          </button>
          <h1 className="text-3xl font-black tracking-tight">{title}</h1>
        </div>

        {/* Desktop Tabs (shown on sm and up) */}
        {destId && (
          <div className="hidden sm:flex p-1 bg-black/5 rounded-full backdrop-blur-sm border border-black/5">
            <button
              onClick={() => setActiveTab("matching")}
              className={`px-5 py-1.5 rounded-full text-sm font-bold transition-all duration-300 ${
                activeTab === "matching"
                  ? "bg-[#e67e22] text-white shadow-md"
                  : "text-gray-700 hover:text-black hover:bg-black/5"
              }`}
            >
              {t("plans.matchingTrips") || (language === "ar" ? "الرحلات المطابقة" : "Matching Trips")}
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`px-5 py-1.5 rounded-full text-sm font-bold transition-all duration-300 ${
                activeTab === "all"
                  ? "bg-[#e67e22] text-white shadow-md"
                  : "text-gray-700 hover:text-black hover:bg-black/5"
              }`}
            >
              {t("plans.allTrips") || (language === "ar" ? "كل الرحلات" : "All Trips")}
            </button>
          </div>
        )}

        <button onClick={() => navigate("/tourist/create-plan")} className="bg-[#e67e22] text-white px-6 py-2 rounded-full flex items-center gap-2 font-bold shadow-md hover:brightness-110 active:scale-95 transition-all">
          <PlusCircle size={20} />
          {createLabel}
        </button>
      </div>

      {/* Mobile Tabs (shown on mobile only) */}
      {destId && (
        <div className="flex sm:hidden justify-center p-1 bg-black/5 rounded-full backdrop-blur-sm border border-black/5 self-center">
          <button
            onClick={() => setActiveTab("matching")}
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
              activeTab === "matching"
                ? "bg-[#e67e22] text-white shadow-md"
                : "text-gray-700 hover:text-black hover:bg-black/5"
            }`}
          >
            {t("plans.matchingTrips") || (language === "ar" ? "الرحلات المطابقة" : "Matching Trips")}
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
              activeTab === "all"
                ? "bg-[#e67e22] text-white shadow-md"
                : "text-gray-700 hover:text-black hover:bg-black/5"
            }`}
          >
            {t("plans.allTrips") || (language === "ar" ? "كل الرحلات" : "All Trips")}
          </button>
        </div>
      )}
    </header>
  );
}

