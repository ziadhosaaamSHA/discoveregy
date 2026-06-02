import { fetchDestinations } from "../../../../../services/destinations-data";
import { tourismApi } from "../../../../../services/tourism-api";
import { extractArray } from "../../../../../shared/utils/api-shapes";
import { mapTripToPlan } from "../../../../../services/mappers/trip.mapper";

// Backend helpers for the Plans page. Centralizes API calls and mapping so
// the React component can remain focused on presentation.

export async function getDestinations() {
  try {
    const data = await fetchDestinations();
    return data || [];
  } catch {
    return [];
  }
}

export async function getTrips() {
  const response = await tourismApi.getTrips();
  const trips = extractArray(response).filter((trip) => typeof trip?.id === "number");
  return trips.map(mapTripToPlan);
}

export async function getTripById(tripId) {
  const response = await tourismApi.getTripById(Number(tripId));
  if (!response) return null;
  if (response && typeof response === "object") {
    return response.data && typeof response.data === "object" ? response.data : response;
  }
  return null;
}

export async function createBooking(payload) {
  return tourismApi.createBooking(payload);
}

export async function payBooking(payload) {
  return tourismApi.payBooking(payload);
}

export async function deleteTrip(tripId) {
  return tourismApi.deleteTrip(tripId);
}
