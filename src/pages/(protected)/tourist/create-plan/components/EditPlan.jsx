import { X, Plus, Trash2, MapPin } from "lucide-react";

export default function EditPlan({
  selectedPlan,
  setIsEditMode,
  isRTL,
  language,
  t,
  customDestinations,
  handleRemoveDest,
  setShowAddDestinations,
  showAddDestinations,
  filteredAvailableDestinations,
  handleAddDest,
  bookingDate,
  TIME_OPTIONS,
  startTime,
  setStartTime,
  durationHours,
  setDurationHours,
  isDurationFilled,
  navigate,
  handleSubmit,
  isSubmittingPlan,
  hasValidBookingDetails,
}) {
  return (
    <div className="animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-black text-[#5d4037]">{selectedPlan.title}</h2>
          <p className="text-gray-600 font-medium mt-1">{t("createPlan.resultsFor", { query: selectedPlan.title })}</p>
        </div>
        <button
          onClick={() => setIsEditMode(false)}
          className="bg-gray-200 p-3 rounded-full hover:bg-gray-300 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-bold uppercase tracking-widest text-[#5d4037]/50">{t("createPlan.selectedStops")}</h4>
            <button
              onClick={() => setShowAddDestinations(true)}
              className="text-[#e67e22] font-black hover:underline flex items-center gap-2"
            >
              <Plus size={20} strokeWidth={3} /> {t("createPlan.addPlace")}
            </button>
          </div>

          <div className="max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#e67e22]/20 scrollbar-track-transparent">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {customDestinations.map((dest) => (
                <div key={dest.id} className="relative bg-white rounded-3xl overflow-hidden shadow-md border-2 border-white group h-fit">
                  <div className="h-40 overflow-hidden">
                    <img src={dest.image} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="font-bold text-gray-800">{dest.copy[language]?.name || dest.copy.en.name}</span>
                    <button
                      onClick={() => handleRemoveDest(dest.id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
              {customDestinations.length === 0 && (
                <div className="col-span-full py-12 border-4 border-dashed border-black/10 rounded-[40px] flex flex-col items-center justify-center text-gray-400">
                  <MapPin size={48} className="mb-4 opacity-20" />
                  <p className="font-bold px-6 text-center">{t("createPlan.emptyStops")}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Booking Details Sidebar */}
        <div className="bg-[#5d4037]/5 rounded-[40px] p-6 md:p-8 border border-[#5d4037]/10 h-fit space-y-8">
          <h4 className="text-xl font-black text-[#5d4037] uppercase tracking-widest border-b border-[#5d4037]/10 pb-4">{t("createPlan.tripDetails")}</h4>

          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-black text-[#e67e22] uppercase tracking-tighter">{t("createPlan.dateLabel")}</span>
              <input type="date" value={bookingDate} disabled className="min-w-0 w-full bg-white rounded-2xl px-4 py-4 border-none outline-none shadow-sm font-bold disabled:opacity-100 disabled:text-gray-800" />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-black text-[#e67e22] uppercase tracking-tighter">{t("createPlan.durationLabel")}</span>
              <div className="relative min-w-0 w-full">
                <input
                  type="number"
                  min="1"
                  value={durationHours}
                  onChange={(event) => setDurationHours(event.target.value)}
                  className="min-w-0 w-full bg-white rounded-2xl px-4 py-4 border-none outline-none shadow-sm font-bold"
                />
                {!isDurationFilled && (
                  <span className="absolute inset-y-0 right-4 flex items-center text-xs font-black text-gray-500 uppercase">{t("createPlan.hours")}</span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-black text-[#e67e22] uppercase tracking-tighter">{t("createPlan.startTimeLabel")}</span>
              <select
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                className="min-w-0 w-full bg-white rounded-2xl px-4 py-4 border-none outline-none shadow-sm font-bold"
              >
                <option value="">{t("createPlan.selectTime")}</option>
                {TIME_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => navigate("/tourist/pay")}
              className="w-full px-5 py-3 rounded-2xl bg-[#5d4037] text-white font-bold hover:brightness-110 transition-all"
            >
              {t("createPlan.editInPay")}
            </button>
            {!hasValidBookingDetails && (
              <p className="text-sm font-bold text-red-700">{t("createPlan.missingDetails")}</p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmittingPlan || !hasValidBookingDetails}
            className="w-full bg-[#e67e22] text-white py-5 rounded-3xl text-2xl font-black shadow-xl hover:brightness-110 active:scale-95 transition-all mt-4"
          >
            {isSubmittingPlan ? (t("common.loading") || "Loading...") : t("createPlan.submit")}
          </button>
        </div>
      </div>

      {/* Add Destinations Modal/Panel */}
      {showAddDestinations && (
        <div className="fixed inset-0 z-50 bg-[#F2E0CA]/95 backdrop-blur-md flex items-center justify-center p-6" dir={isRTL ? "rtl" : "ltr"}>
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden border border-black/5">
            <div className="p-8 border-b border-gray-100 flex items-center gap-6">
              <input
                autoFocus
                type="text"
                placeholder={t("createPlan.searchPlaceholder")}
                className="text-2xl font-bold w-full outline-none"
              />
              <button onClick={() => setShowAddDestinations(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={32} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredAvailableDestinations.map((dest) => (
                <div key={dest.id} onClick={() => handleAddDest(dest)} className="cursor-pointer group flex flex-col gap-3">
                  <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-sm group-hover:shadow-lg transition-all group-hover:scale-[1.02]">
                    <img src={dest.image} className="w-full h-full object-cover" />
                  </div>
                  <span className="font-black text-gray-700 px-2">{dest.copy[language]?.name || dest.copy.en.name}</span>
                </div>
              ))}
              {filteredAvailableDestinations.length === 0 && (
                <div className="col-span-full py-20 text-center text-gray-400 font-bold">{t("createPlan.noResults")}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
