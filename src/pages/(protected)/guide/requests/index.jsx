import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../../context/LanguageContext";
import { SectionHeader } from "../../../../components/ui";
import { tourismApi } from "../../../../services/tourism-api";
import { RequestCard } from "./components/RequestCard";

// Requests lets guides review incoming requests and manage accepted trips.
export default function Requests() {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const normalizeRequest = useMemo(
    () => (raw) => {
      const id = raw?.id ?? raw?.requestId ?? Date.now();
      const touristName =
        raw?.touristName ??
        raw?.tourist?.name ??
        raw?.userName ??
        raw?.touristId ??
        `#${id}`;

      const tripType = raw?.tripType ?? raw?.title ?? raw?.trip?.title ?? "-";
      const location = raw?.location ?? raw?.destination ?? raw?.trip?.destination ?? raw?.trip?.location ?? "-";
      const date = raw?.date ?? raw?.startDate ?? raw?.createdAt ?? "-";
      const people = raw?.people ?? raw?.numberOfPeople ?? raw?.trip?.numberOfPeople ?? "-";
      const conversationId = raw?.conversationId ?? raw?.conversation?.id ?? id;
      const status = String(raw?.status || "").toLowerCase();

      return {
        id,
        touristName,
        tripType,
        location,
        date,
        people,
        conversationId,
        status,
      };
    },
    []
  );

  useEffect(() => {
    let cancelled = false;

    const loadRequests = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await tourismApi.getGuideRequests();
        const source = Array.isArray(response)
          ? response
          : Array.isArray(response?.items)
            ? response.items
            : Array.isArray(response?.data)
              ? response.data
              : [];

        const mapped = source.map(normalizeRequest);
        if (cancelled) return;

        setTrips(mapped.filter((item) => item.status === "accepted"));
        setRequests(mapped.filter((item) => item.status !== "accepted"));
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Failed to load guide requests.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadRequests();

    return () => {
      cancelled = true;
    };
  }, [normalizeRequest]);

  const handleAccept = async (id) => {
    const item = requests.find(r => r.id === id);
    if (!item) return;

    try {
      const detailsResponse = await tourismApi.getGuideRequestById(id).catch(() => null);
      const detailsPayload =
        detailsResponse && typeof detailsResponse === "object"
          ? (detailsResponse.data && typeof detailsResponse.data === "object" ? detailsResponse.data : detailsResponse)
          : null;
      const normalizedDetails = detailsPayload ? normalizeRequest(detailsPayload) : null;

      await tourismApi.acceptGuideRequest(id);
      setTrips((prev) => [...prev, { ...(normalizedDetails || item), status: "accepted" }]);
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err?.message || "Could not accept request.");
    }
  };

  const handleChat = (convId) => navigate(`/chats/${convId}`);

  const handleCancel = async (id, fromTrips) => {
    if (fromTrips) {
      setTrips((prev) => prev.filter((trip) => trip.id !== id));
      return;
    }

    try {
      await tourismApi.rejectGuideRequest(id);
      setRequests((prev) => prev.filter((request) => request.id !== id));
    } catch (err) {
      setError(err?.message || "Could not reject request.");
    }
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
                <button
                  onClick={() => setRequests([])}
                  className="px-8 py-3 bg-[#d43e0b] text-white font-black rounded-2xl shadow-lg hover:brightness-110 active:scale-95 transition-all"
                >
                  {t("requests.clearAll")}
                </button>
              )}
            </div>

            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Error retrieving.
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left" style={{ textAlign: isRTL ? 'right' : 'left' }}>
              {requests.map(request => (
                <RequestCard key={request.id} request={request} onAccept={handleAccept} onChat={handleChat} onCancel={handleCancel} t={t} />
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
