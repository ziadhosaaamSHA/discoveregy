import { TIME_OPTIONS } from "./planUtils";
import { Calendar, Clock, Hourglass, Edit3 } from "lucide-react";

// BookingSettings lets tourists review date and adjust duration/start time before submit.
export function BookingSettings({
  bookingDate,
  durationHours,
  startTime,
  isSubmittingBooking,
  hasValidBookingDetails,
  destId,
  navigate,
  t,
  onDurationChange,
  onStartTimeChange,
  onSubmit,
  activePlan,
  language,
}) {
  const isDurationFilled = durationHours !== '' && durationHours !== null && durationHours !== undefined;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#fbf5ee]/95 backdrop-blur-md border-t border-[#8a4b10]/10 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] py-4 px-6 transition-all duration-300">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left/Start side: Selection details */}
        <div className="flex flex-wrap items-center gap-4 lg:gap-6 w-full md:w-auto justify-center md:justify-start">
          {activePlan && (
            <div className="hidden lg:flex flex-col border-r border-[#8a4b10]/20 pr-6">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {t("plans.selectedPlan") || "Selected Plan"}
              </span>
              <span className="font-extrabold text-black truncate max-w-[200px]">
                {activePlan.title[language] || activePlan.title.en}
              </span>
              <span className="text-sm font-black text-[#e67e22]">
                {activePlan.price ? `${activePlan.price} EGP` : ""}
              </span>
            </div>
          )}

          {/* Date */}
          <div className="flex items-center gap-2 bg-white/80 rounded-2xl px-4 py-2 border border-[#8a4b10]/10 shadow-sm">
            <Calendar size={18} className="text-[#e67e22]" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t("createPlan.dateLabel") || "Date"}</span>
              <span className="text-sm font-bold text-gray-800">{bookingDate}</span>
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-2 bg-white/80 rounded-2xl px-4 py-2 border border-[#8a4b10]/10 shadow-sm min-w-[130px]">
            <Hourglass size={18} className="text-[#e67e22]" />
            <div className="flex flex-col flex-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t("createPlan.durationLabel") || "Duration"}</span>
              <div className="flex items-center">
                <input
                  type="number"
                  min="1"
                  value={durationHours}
                  onChange={(event) => onDurationChange(event.target.value)}
                  className="w-12 bg-transparent border-none outline-none font-bold text-sm text-gray-800 p-0"
                />
                <span className="text-xs font-bold text-gray-500 uppercase">{t("createPlan.hours") || "h"}</span>
              </div>
            </div>
          </div>

          {/* Start Time */}
          <div className="flex items-center gap-2 bg-white/80 rounded-2xl px-4 py-2 border border-[#8a4b10]/10 shadow-sm">
            <Clock size={18} className="text-[#e67e22]" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t("createPlan.startTimeLabel") || "Start Time"}</span>
              <select
                value={startTime}
                onChange={(event) => onStartTimeChange(event.target.value)}
                className="bg-transparent border-none outline-none font-bold text-sm text-gray-800 p-0 cursor-pointer"
              >
                <option value="">{t("createPlan.selectTime") || "Select Time"}</option>
                {TIME_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(destId ? `/tourist/pay?destId=${destId}` : "/tourist/pay")}
            className="p-3 rounded-2xl bg-[#5d4037]/10 text-[#5d4037] hover:bg-[#5d4037]/20 transition-all"
            title={t("createPlan.editInPay")}
          >
            <Edit3 size={18} />
          </button>
        </div>

        {/* Right side: Submission Button */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          {!hasValidBookingDetails && (
            <span className="text-xs font-bold text-red-600 hidden md:inline max-w-[200px] text-right">
              {t("createPlan.invalidBookingDetails") || "Please complete details."}
            </span>
          )}
          <button
            onClick={onSubmit}
            disabled={isSubmittingBooking || !hasValidBookingDetails || !activePlan}
            className="flex-1 md:flex-none bg-[#e67e22] text-white px-8 py-3.5 rounded-2xl font-black shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isSubmittingBooking ? (t("common.loading") || "Loading...") : (t("createPlan.submit") || "Book Now")}
          </button>
        </div>
      </div>
    </div>
  );
}

