import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, MessageCircle, X } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useLanguage } from "../context/LanguageContext";
import { INITIAL_REQUESTS } from "../data/requests";
import { SectionHeader } from "../components/common/SectionHeader";

function RequestCard({ request, onAccept, onChat, onCancel, isAccepted = false }) {
    const { t, language, isRTL }           = useLanguage();

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
            <p className="text-sm font-bold">{typeof request.tripType === 'object' ? (request.tripType[language] || request.tripType.en) : request.tripType}</p>
          </div>
          <div>
            <p className="text-black text-[10px] uppercase font-black opacity-60">{t("requests.location")}</p>
            <p className="text-sm font-bold">{typeof request.location === 'object' ? (request.location[language] || request.location.en) : request.location}</p>
          </div>
          <div>
            <p className="text-black text-[10px] uppercase font-black opacity-60">{t("requests.date")}</p>
            <p className="text-sm font-bold">{typeof request.date === 'object' ? (request.date[language] || request.date.en) : request.date}</p>
          </div>
          <div>
            <p className="text-black text-[10px] uppercase font-black opacity-60">{t("requests.people")}</p>
            <p className="text-sm font-bold">{request.people}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 justify-end">
        {!isAccepted && (
          <button
            onClick={() => onAccept(request.id)}
            className="w-11 h-11 rounded-full bg-[#f2e0ca] flex items-center justify-center hover:bg-white transition-all shadow-md active:scale-90"
            aria-label="Accept"
          >
            <Check size={22} className="text-[#154d7d]" strokeWidth={3} />
          </button>
        )}
        <button
          onClick={() => onChat(request.conversationId)}
          className="w-11 h-11 rounded-full bg-[#f2e0ca] flex items-center justify-center hover:bg-white transition-all shadow-md active:scale-90"
          aria-label="Chat"
        >
          <MessageCircle size={20} className="text-[#154d7d]" />
        </button>
        <button
          onClick={() => onCancel(request.id, isAccepted)}
          className="w-11 h-11 rounded-full bg-[#d43e0b] flex items-center justify-center hover:brightness-110 shadow-md active:scale-90 transition-all"
          aria-label="Cancel"
        >
          <X size={20} className="text-white" strokeWidth={3} />
        </button>
      </div>
    </motion.div>
  );
}

export default function Requests() {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [trips, setTrips] = useState([]);

  const handleAccept = (id) => {
    const item = requests.find(r => r.id === id);
    if (item) {
      setTrips([...trips, { ...item, status: "accepted" }]);
      setRequests(requests.filter(r => r.id !== id));
    }
  };

  const handleChat = (convId) => navigate(`/chats/${convId}`);

  const handleCancel = (id, fromTrips) => {
    if (fromTrips) setTrips(trips.filter(t => t.id !== id));
    else setRequests(requests.filter(r => r.id !== id));
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F2E0CA" }}>
      <Header />

      <main className="pt-28 pb-16 px-6">
        <div className="max-w-[1240px] mx-auto">
          {/* Your Trips Section */}
          <section className="mb-20">
            <SectionHeader title={t("requests.yourTrips")} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left" style={{ textAlign: isRTL ? 'right' : 'left' }}>
              {trips.map(trip => (
                <RequestCard key={trip.id} request={trip} onChat={handleChat} onCancel={handleCancel} isAccepted t={t} />
              ))}
              {trips.length === 0 && (
                <div className="col-span-full py-12 text-center bg-black/5 rounded-[40px] border-2 border-dashed border-black/10">
                   <p className="text-gray-500 font-bold italic">{t("requests.noTrips")}</p>
                </div>
              )}
            </div>
          </section>

          {/* New Requests Section */}
          <section>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
              <h2 className="text-4xl font-black text-black mb-4 sm:mb-0">{t("requests.title")}</h2>
              {requests.length > 0 && (
                <button
                  onClick={() => setRequests([])}
                  className="px-8 py-3 bg-[#d43e0b] text-white font-black rounded-2xl shadow-lg hover:brightness-110 active:scale-95 transition-all"
                >
                  {t("requests.clearAll")}
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left" style={{ textAlign: isRTL ? 'right' : 'left' }}>
              {requests.map(request => (
                <RequestCard key={request.id} request={request} onAccept={handleAccept} onChat={handleChat} onCancel={handleCancel} t={t} />
              ))}
              {requests.length === 0 && (
                <div className="col-span-full py-12 text-center bg-black/5 rounded-[40px] border-2 border-dashed border-black/10">
                   <p className="text-gray-500 font-bold italic">{t("requests.checking")}</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}