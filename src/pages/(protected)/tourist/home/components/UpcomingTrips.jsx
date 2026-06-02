import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, X } from "lucide-react";

// UpcomingTrips renders bookings and custom trips list for tourists.
export default function UpcomingTrips({
  upcomingTrips,
  isLoadingUpcomingTrips,
  isRTL,
  language,
  t,
  requestCancelTrip,
  cancellingTripId,
  onChat,
}) {
  return (
    <section id="upcoming-trips" className="max-w-[1200px] mx-auto px-6 py-12 lg:pt-8 lg:pb-0">
      <motion.h2
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-[32px] lg:text-[38px] font-bold text-black text-center mb-10"
      >
        {t("destination.upcomingTrips") || "Your Upcoming Trips"}
      </motion.h2>
      {isLoadingUpcomingTrips ? (
        <div className="py-12 text-center bg-black/5 rounded-2xl border-2 border-dashed border-black/10">
          <p className="text-gray-500 font-bold italic">{t("common.loading") || "Loading..."}</p>
        </div>
      ) : upcomingTrips.length === 0 ? (
        <div className="py-12 text-center bg-black/5 rounded-2xl border-2 border-dashed border-black/10">
          <p className="text-gray-500 font-bold italic">{t("tourist.home.noUpcomingTrips") || "No upcoming trips."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingTrips.map((trip) => {
            const gName = (trip.guideName && typeof trip.guideName === 'object') ? (trip.guideName[language] || trip.guideName.en) : (trip.guideName || "");
            const tType = (trip.tripType && typeof trip.tripType === 'object') ? (trip.tripType[language] || trip.tripType.en) : (trip.tripType || "");
            const tDate = (trip.date && typeof trip.date === 'object') ? (trip.date[language] || trip.date.en) : (trip.date || "");

            return (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-[#154d7d] rounded-2xl p-5 shadow-lg flex items-center gap-4 ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}
              >
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#f2e0ca]/30 flex-shrink-0">
                  {trip.guideImage ? (
                    <img src={trip.guideImage} alt={gName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#0f3c61]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[#f2e0ca] font-bold truncate">{gName}</h3>
                  <p className="text-[#f2e0ca]/70 text-xs truncate">{tType}</p>
                  <p className="text-[#f2e0ca]/50 text-[10px] mt-1">{tDate}</p>
                </div>
                 <div className="flex items-center gap-2">
                   {(trip.conversationId || trip.guideId) ? (
                     <button
                       type="button"
                       onClick={() => onChat(trip)}
                       className="w-10 h-10 rounded-full bg-[#f2e0ca] flex items-center justify-center hover:bg-white transition-colors flex-shrink-0 cursor-pointer"
                       aria-label={t("chats.title") || "Chat"}
                       title={t("chats.title") || "Chat"}
                     >
                       <MessageCircle size={18} className="text-[#154d7d]" />
                     </button>
                   ) : (
                     <div className="w-10 h-10 rounded-full bg-[#f2e0ca]/60 flex items-center justify-center flex-shrink-0" title="No chat guide assigned">
                       <MessageCircle size={18} className="text-[#154d7d]/60" />
                     </div>
                   )}
                    <button
                      type="button"
                      onClick={() => requestCancelTrip(trip)}
                      disabled={cancellingTripId === trip.id}
                      className="w-10 h-10 rounded-full bg-[#f2e0ca] flex items-center justify-center hover:bg-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      aria-label={t("destination.cancelTrip")}
                      title={t("destination.cancelTrip")}
                    >
                      <X size={18} className="text-[#154d7d]" />
                    </button>
                 </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
