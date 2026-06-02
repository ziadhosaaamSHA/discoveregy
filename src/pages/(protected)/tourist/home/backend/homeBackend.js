import { fetchDestinations } from "../../../../../services/destinations-data";
import { resolveApiAssetUrl } from "../../../../../services/api-client";
import { tourismApi } from "../../../../../services/tourism-api";

// Backend integration layer for Tourist Home — keeps data fetching and mapping
// logic out of the React component so the UI stays simple and testable.

export async function getDestinations() {
  try {
    const data = await fetchDestinations();
    return data || [];
  } catch {
    return [];
  }
}

export async function getUpcomingTrips(user) {
  // Returns an array of normalized upcoming trips (bookings + custom trips)
  // with the same shape the UI expects.
  if (!user) return [];

  const [bookingsResponse, customTripsResponse] = await Promise.all([
    tourismApi.getBookings().catch(() => []),
    user?.type === "tourist" ? tourismApi.getMyCustomTrips().catch(() => []) : Promise.resolve([]),
  ]);

  const source = Array.isArray(bookingsResponse)
    ? bookingsResponse
    : Array.isArray(bookingsResponse?.items)
    ? bookingsResponse.items
    : Array.isArray(bookingsResponse?.data)
    ? bookingsResponse.data
    : [];

  const customSource = Array.isArray(customTripsResponse)
    ? customTripsResponse
    : Array.isArray(customTripsResponse?.items)
    ? customTripsResponse.items
    : Array.isArray(customTripsResponse?.data)
    ? customTripsResponse.data
    : [];

  const mappedBookings = source
    .map((booking) => {
      const tripName =
        booking?.planName || booking?.tripTitle || booking?.planTitle || booking?.title || "";
      const planType = booking?.planType || "";
      const guideName = booking?.guideName || booking?.guide?.name || "";
      const displayName = guideName || planType;
      const startDate = booking?.startDate || booking?.startDateTime || booking?.date || "";
      const formattedDate = startDate ? new Date(startDate).toLocaleDateString() : "";
      const amountValue = Number(booking?.amount ?? booking?.totalPrice ?? booking?.price);
      const bookingId = booking?.id;
      const status = String(booking?.status || "").toLowerCase();

      return {
        id: bookingId === undefined || bookingId === null ? "" : String(bookingId),
        guideName: { en: displayName, ar: displayName },
        guideImage: resolveApiAssetUrl(booking?.guideImageUrl || booking?.guide?.imageUrl),
        tripType: { en: tripName, ar: tripName },
        date: { en: formattedDate, ar: formattedDate },
        conversationId: booking?.conversationId ? String(booking.conversationId) : null,
        paymentMethod: booking?.paymentMethod || "",
        amount: Number.isFinite(amountValue) ? amountValue : null,
        status,
      };
    })
    .filter((booking) => booking.id && booking.status !== "cancelled" && booking.status !== "rejected");

  const mappedCustomTrips = customSource
    .filter((trip) => typeof trip?.id === "number")
    .map((trip) => {
      const customTitle = trip?.title || "";
      const startDate = trip?.startDateTime || "";
      const formattedDate = startDate ? new Date(startDate).toLocaleDateString() : "";
      const customLead = trip?.destination || trip?.status || "";
      return {
        id: `custom-${trip.id}`,
        guideName: { en: customLead, ar: customLead },
        guideImage: resolveApiAssetUrl(trip?.imageUrl),
        tripType: { en: customTitle, ar: customTitle },
        date: { en: formattedDate, ar: formattedDate },
        conversationId: null,
        paymentMethod: "",
        amount: null,
        status: String(trip?.status || "").toLowerCase(),
      };
    })
    .filter((trip) => trip.status !== "cancelled" && trip.status !== "rejected");

  return [...mappedBookings, ...mappedCustomTrips];
}

export async function cancelTrip(trip) {
  // Accepts the normalized trip object used by the UI and performs the
  // cancellation or deletion. Throws on failure.
  if (!trip?.id) throw new Error("invalid-trip-id");

  const customTripMatch = /^custom-(\d+)$/.exec(String(trip.id));
  const customTripId = customTripMatch ? Number(customTripMatch[1]) : null;

  if (Number.isFinite(customTripId)) {
    // custom trip deletion
    await tourismApi.deleteTrip(customTripId);
    return true;
  }

  const tripIdNumber = Number(trip.id);
  if (!Number.isFinite(tripIdNumber)) throw new Error("invalid-booking-id");

  // Fetch booking details to determine payment method / amount
  const detailResponse = await tourismApi.getBookingById(tripIdNumber);
  const bookingDetails =
    detailResponse && typeof detailResponse === "object"
      ? bookingDetailsFromResponse(detailResponse)
      : null;

  await tourismApi.cancelBooking(tripIdNumber, { reason: "Cancelled by user" });

  const paymentMethod = String((bookingDetails?.paymentMethod || trip.paymentMethod || "")).toLowerCase();
  const detailAmount = Number(bookingDetails?.amount ?? bookingDetails?.totalPrice ?? bookingDetails?.price);
  const refundAmount = Number.isFinite(detailAmount) ? detailAmount : trip.amount;

  if (paymentMethod === "visa") {
    try {
      await tourismApi.refundBooking({ bookingId: tripIdNumber, reason: "Booking cancelled by user", amount: Number.isFinite(refundAmount) ? refundAmount : undefined });
    } catch (err) {
      // Refund failed but cancellation succeeded; log and continue so UI reflects deletion
      // Do not throw here to avoid reporting a false failure to the user
      console.error("refund failed for booking", tripIdNumber, err);
    }
  }

  return true;
}

function bookingDetailsFromResponse(resp) {
  if (resp == null) return null;
  if (Array.isArray(resp)) return resp[0];
  if (typeof resp === "object") {
    if (typeof resp.data === "object") return resp.data;
    return resp;
  }
  return null;
}
