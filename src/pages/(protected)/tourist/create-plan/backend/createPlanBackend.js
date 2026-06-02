import { generateTravelPlan } from "../../../../../services/ai";
import { fetchDestinations } from "../../../../../services/destinations-data";
import { tourismApi } from "../../../../../services/tourism-api";
export { extractBookingId, extractTripId } from "../../../../../services/mappers/booking.mapper";

export async function getDestinations() {
  try {
    const data = await fetchDestinations();
    return data || [];
  } catch {
    return [];
  }
}

export async function generatePlans(prompt, language) {
  return generateTravelPlan(prompt, language);
}

export async function createCustomTrip(payload) {
  return tourismApi.createCustomTrip(payload);
}

export async function createBooking(payload) {
  return tourismApi.createBooking(payload);
}

export async function payBooking(payload) {
  return tourismApi.payBooking(payload);
}
