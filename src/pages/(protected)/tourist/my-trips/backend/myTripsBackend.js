import { fetchDestinations } from "../../../../../services/destinations-data";
import { tourismApi } from "../../../../../services/tourism-api";
import { extractArray } from "../../../../../shared/utils/api-shapes";
import { mapTripToPlan } from "../../../../../services/mappers/trip.mapper";
import { normalizeBooking } from "../../../../../services/mappers/booking.mapper";

/**
 * Loads, normalizes, and correlates bookings, predefined trips, custom trips,
 * and public destinations for the My Trips dashboard.
 */
export async function loadMyTrips() {
  const [bookingsRes, customTripsRes, predefinedTripsRes, destinationsRes] = await Promise.all([
    tourismApi.getBookings().catch(() => []),
    tourismApi.getMyCustomTrips().catch(() => []),
    tourismApi.getTrips().catch(() => []),
    fetchDestinations().catch(() => []),
  ]);

  const bookings = extractArray(bookingsRes);
  const customTrips = extractArray(customTripsRes);
  const predefinedTrips = extractArray(predefinedTripsRes).map(mapTripToPlan);
  const destinations = destinationsRes || [];

  const destinationMap = new Map(destinations.map((d) => [d.id, d]));

  const mappedBookings = bookings.map((booking) =>
    normalizeBooking(booking, {
      customTrips,
      predefinedTrips,
      destinations,
      destinationMap,
    })
  );

  return {
    bookings: mappedBookings,
    destinations,
  };
}

/**
 * Cancels a booking on the backend and initiates refund processing for Visa transactions.
 */
export async function cancelTripBooking(bookingId, amount, paymentMethod) {
  const tripIdNumber = Number(bookingId);
  if (!Number.isFinite(tripIdNumber)) throw new Error("Invalid booking ID");

  await tourismApi.cancelBooking(tripIdNumber, { reason: "Cancelled by tourist" });

  const methodNormalized = String(paymentMethod || "").toLowerCase();
  if (methodNormalized === "visa" && Number.isFinite(amount) && amount > 0) {
    try {
      await tourismApi.refundBooking({
        bookingId: tripIdNumber,
        reason: "Booking cancelled by tourist",
        amount: amount,
      });
    } catch (err) {
      console.error("Refund failed for booking", tripIdNumber, err);
    }
  }
  return true;
}

/**
 * Direct shortcut to load or construct a conversation ID with a guide.
 */
export async function getOrCreateConversation(guideId) {
  if (!guideId) return null;
  const response = await tourismApi.createConversation({ guideId: Number(guideId) });
  const cid = response?.id ?? response?.conversationId ?? response?.data?.id ?? response?.data?.conversationId;
  return cid ? String(cid) : null;
}
