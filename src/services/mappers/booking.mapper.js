import { extractNumericId } from "../../shared/utils/ids";
import { resolveApiAssetUrl } from "../api-client";

export function extractTripId(payload) {
  return extractNumericId(payload);
}

export function extractBookingId(payload) {
  return extractNumericId(payload);
}

export function extractConversationId(payload) {
  if (typeof payload === "number") return payload;
  if (typeof payload === "string" && /^\d+$/.test(payload)) return Number(payload);
  if (!payload || typeof payload !== "object") return null;

  const candidates = [
    payload.id,
    payload.conversationId,
    payload.data?.id,
    payload.data?.conversationId,
    payload.result?.id,
    payload.result?.conversationId,
  ];

  for (const value of candidates) {
    if (typeof value === "number") return value;
    if (typeof value === "string" && /^\d+$/.test(value)) return Number(value);
  }

  return null;
}

export function mapPaymentMethod(value) {
  const normalized = String(value || "").toLowerCase();
  return normalized === "visa" ? "Visa" : "Cash";
}

/**
 * Normalizes API booking response structures into clean UI-facing models.
 * Resolves localized titles and descriptions, parses stops/itineraries, and defaults fields.
 */
export function normalizeBooking(booking, options = {}) {
  const { customTrips = [], predefinedTrips = [], destinations = [], destinationMap = new Map() } = options;

  const bookingId = booking?.id;
  const planId = booking?.planId || booking?.tripId;
  const rawPlanType = String(booking?.planType || "").toLowerCase();
  const planName = String(booking?.planName || booking?.tripTitle || booking?.planTitle || booking?.title || "");

  const startDate = booking?.startDate || booking?.startDateTime || booking?.date || "";
  const endDate = booking?.endDate || booking?.endDateTime || "";
  const amount = Number(booking?.amount ?? booking?.totalPrice ?? booking?.price ?? 0);
  const status = String(booking?.status || "pending").toLowerCase();
  const paymentMethod = booking?.paymentMethod || "Cash";

  const guideId = booking?.guideId || booking?.guide?.id || booking?.guide?.userId || null;
  const guideName = booking?.guideName || booking?.guide?.name || "";
  const guideImage = resolveApiAssetUrl(booking?.guideImageUrl || booking?.guide?.imageUrl);

  let title = planName;
  let description = booking?.description || "";
  let resolvedStops = [];
  let customStopString = "";

  const isCustomPlan =
    rawPlanType === "custom" ||
    planName.toLowerCase().includes("custom") ||
    !predefinedTrips.some((t) => Number(t.id) === Number(planId));

  if (isCustomPlan) {
    const customTrip = customTrips.find((t) => Number(t.id) === Number(planId));
    if (customTrip) {
      title = customTrip.title || title || "Custom Plan";
      description = customTrip.description || description || "";
      customStopString = customTrip.destination || "";

      const stopNames = String(customTrip.destination || "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      resolvedStops = destinations.filter((d) => {
        const enName = String(d.copy?.en?.name || "").toLowerCase();
        const arName = String(d.copy?.ar?.name || "").toLowerCase();
        return stopNames.some(
          (name) =>
            name.includes(enName) ||
            name.includes(arName) ||
            enName.includes(name) ||
            arName.includes(name)
        );
      });
    }
  } else {
    const predefinedTrip = predefinedTrips.find((t) => Number(t.id) === Number(planId));
    if (predefinedTrip) {
      title = predefinedTrip.title;
      description = predefinedTrip.description;
      const placeIds = predefinedTrip.destinations || [];
      resolvedStops = placeIds.map((pid) => destinationMap.get(pid)).filter(Boolean);
    }
  }

  return {
    id: String(bookingId),
    planId,
    planType: isCustomPlan ? "custom" : "predefined",
    title: typeof title === "object" ? title : { en: title, ar: title },
    description: typeof description === "object" ? description : { en: description, ar: description },
    startDate,
    endDate,
    amount: Number.isFinite(amount) ? amount : 0,
    status,
    paymentMethod,
    guideId: guideId ? String(guideId) : null,
    guideName,
    guideImage,
    conversationId: booking?.conversationId ? String(booking.conversationId) : null,
    stops: resolvedStops,
    customStopString,
  };
}
