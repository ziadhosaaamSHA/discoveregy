import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../../context/LanguageContext";
import { Button, SectionHeader } from "../../../../components/ui";
import { RequestCard } from "./components/RequestCard";
import { useGuideRequests } from "./hooks/useGuideRequests";

// Requests lets guides review incoming requests and manage accepted trips.
export default function Requests() {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const {
    requests,
    trips,
    isLoading,
    error,
    acceptRequest,
    rejectRequest,
    removeAcceptedTrip,
    clearRequests,
  } = useGuideRequests();

  const handleChat = (convId) => navigate(`/chats/${convId}`);

  const handleCancel = async (id, fromTrips) => {
    if (fromTrips) {
      removeAcceptedTrip(id);
      return;
    }

    await rejectRequest(id);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F2E0CA" }}>

      <main className="pt-28 pb-16 px-6">
        <div className="max-w-[1240px] mx-auto">
          {/* Your Trips Section */}
          <section className="mb-20">
            <SectionHeader title={t("requests.yourTrips")} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left" style={{ textAlign: isRTL ? 'right' : 'left' }}>
              {trips.map(trip => (
                <RequestCard key={trip.id} request={trip} onChat={handleChat} onCancel={handleCancel} isAccepted t={t} />
              ))}
              {!isLoading && !error && trips.length === 0 && (
                <div className="col-span-full py-12 text-center bg-black/5 rounded-[40px] border-2 border-dashed border-black/10">
                   <p className="text-gray-500 font-bold italic">{t("requests.noTrips")}</p>
                </div>
              )}
              {isLoading && (
                <div className="col-span-full py-12 text-center bg-black/5 rounded-[40px] border-2 border-dashed border-black/10">
                   <p className="text-gray-500 font-bold italic">{t("common.loading") || "Loading..."}</p>
                </div>
              )}
              {!isLoading && error && (
                <div className="col-span-full py-12 text-center bg-red-50 rounded-[40px] border-2 border-red-200">
                   <p className="text-red-700 font-bold italic">{t("requests.errorLoading")}</p>
                </div>
              )}
            </div>
          </section>

          {/* New Requests Section */}
          <section>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
              <h2 className="text-4xl font-black text-black mb-4 sm:mb-0">{t("requests.title")}</h2>
              {requests.length > 0 && (
                <Button type="button" variant="danger" onClick={clearRequests}>
                  {t("requests.clearAll")}
                </Button>
              )}
            </div>

            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Error retrieving.
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left" style={{ textAlign: isRTL ? 'right' : 'left' }}>
              {requests.map(request => (
                <RequestCard key={request.id} request={request} onAccept={acceptRequest} onChat={handleChat} onCancel={handleCancel} t={t} />
              ))}
              {!isLoading && !error && requests.length === 0 && (
                <div className="col-span-full py-12 text-center bg-black/5 rounded-[40px] border-2 border-dashed border-black/10">
                   <p className="text-gray-500 font-bold italic">{t("requests.noRequests")}</p>
                </div>
              )}
              {isLoading && (
                <div className="col-span-full py-12 text-center bg-black/5 rounded-[40px] border-2 border-dashed border-black/10">
                   <p className="text-gray-500 font-bold italic">{t("common.loading") || "Loading..."}</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
