import { TIME_OPTIONS } from "./planUtils";

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
}) {
  const isDurationFilled = durationHours !== '' && durationHours !== null && durationHours !== undefined;

  return (
    <div className="mt-20 max-w-6xl mx-auto px-2">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 bg-black/5 p-8 rounded-[40px] border border-black/5 shadow-inner">
        <div className="flex flex-wrap gap-8 items-center justify-center lg:justify-start">
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <span className="text-[#e67e22] text-lg font-black uppercase tracking-wider">{t("createPlan.dateLabel")}</span>
            <input type="date" value={bookingDate} disabled className="w-full sm:w-48 bg-white rounded-xl px-3 py-3 border-none outline-none shadow-sm font-bold disabled:opacity-100 disabled:text-gray-800" />
          </div>
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <span className="text-[#e67e22] text-lg font-black uppercase tracking-wider">{t("createPlan.durationLabel")}</span>
            <div className="relative w-full sm:w-40">
              <input
                type="number"
                min="1"
                value={durationHours}
                onChange={(event) => onDurationChange(event.target.value)}
                className="w-full bg-white rounded-xl px-4 py-3 border-none outline-none shadow-sm font-bold"
              />
              {!isDurationFilled && (
                <span className="absolute inset-y-0 right-4 flex items-center text-xs font-black text-gray-500 uppercase">{t("createPlan.hours")}</span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <span className="text-[#e67e22] text-lg font-black uppercase tracking-wider">{t("createPlan.startTimeLabel")}</span>
            <select
              value={startTime}
              onChange={(event) => onStartTimeChange(event.target.value)}
              className="w-full sm:w-44 bg-white rounded-xl px-4 py-3 border-none outline-none shadow-sm font-bold"
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
            onClick={() => navigate(destId ? `/tourist/pay?destId=${destId}` : "/tourist/pay")}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#5d4037] text-white font-bold hover:brightness-110 transition-all"
          >
            {t("createPlan.editInPay")}
          </button>
        </div>
        <button
          onClick={onSubmit}
          disabled={isSubmittingBooking || !hasValidBookingDetails}
          className="bg-[#e67e22] text-white px-12 py-5 rounded-3xl text-2xl font-black shadow-xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap mt-4 lg:mt-0"
        >
          {isSubmittingBooking ? (t("common.loading") || "Loading...") : t("createPlan.submit")}
        </button>
      </div>
      {!hasValidBookingDetails && (
        <p className="mt-4 text-sm font-bold text-red-700 text-center">{t("createPlan.invalidBookingDetails")}</p>
      )}
    </div>
  );
}
