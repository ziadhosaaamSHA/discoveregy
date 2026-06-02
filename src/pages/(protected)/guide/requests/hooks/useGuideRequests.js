import { useCallback, useEffect, useState } from "react";
import { tourismApi } from "../../../../../services/tourism-api";
import {
  normalizeGuideRequest,
  normalizeGuideRequests,
} from "../../../../../features/guides/guideRequestMappers";

// Keeps guide request API orchestration out of the page view component.
export function useGuideRequests() {
  const [requests, setRequests] = useState([]);
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadRequests = async () => {
      try {
        const response = await tourismApi.getGuideRequests();
        if (controller.signal.aborted) return;

        const mapped = normalizeGuideRequests(response);
        setError("");
        setTrips(mapped.filter((item) => item.status === "accepted"));
        setRequests(mapped.filter((item) => item.status !== "accepted"));
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err?.message || "Failed to load guide requests.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadRequests();
    return () => controller.abort();
  }, []);

  const acceptRequest = useCallback(async (id) => {
    const item = requests.find((request) => request.id === id);
    if (!item) return;

    try {
      const detailsResponse = await tourismApi.getGuideRequestById(id).catch(() => null);
      const detailsPayload =
        detailsResponse && typeof detailsResponse === "object"
          ? (detailsResponse.data && typeof detailsResponse.data === "object" ? detailsResponse.data : detailsResponse)
          : null;
      const normalizedDetails = detailsPayload ? normalizeGuideRequest(detailsPayload) : null;

      await tourismApi.acceptGuideRequest(id);
      setTrips((prev) => [...prev, { ...(normalizedDetails || item), status: "accepted" }]);
      setRequests((prev) => prev.filter((request) => request.id !== id));
    } catch (err) {
      setError(err?.message || "Could not accept request.");
    }
  }, [requests]);

  const rejectRequest = useCallback(async (id) => {
    try {
      await tourismApi.rejectGuideRequest(id);
      setRequests((prev) => prev.filter((request) => request.id !== id));
    } catch (err) {
      setError(err?.message || "Could not reject request.");
    }
  }, []);

  const removeAcceptedTrip = useCallback((id) => {
    setTrips((prev) => prev.filter((trip) => trip.id !== id));
  }, []);

  const clearRequests = useCallback(() => {
    setRequests([]);
  }, []);

  return {
    requests,
    trips,
    isLoading,
    error,
    acceptRequest,
    rejectRequest,
    removeAcceptedTrip,
    clearRequests,
  };
}
