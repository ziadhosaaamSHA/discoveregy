import { generateTravelPlan } from "../../../../../services/ai";
import { fetchDestinations } from "../../../../../services/destinations-data";
import { tourismApi } from "../../../../../services/tourism-api";

function findIdRecursive(obj, seen = new Set()) {
  if (!obj || typeof obj !== "object" || seen.has(obj)) return null;
  seen.add(obj);

  const keys = ["id", "tripId", "bookingId", "value", "data", "result", "trip", "booking"];
  for (const key of keys) {
    const val = obj[key];
    if (val !== undefined && val !== null) {
      if (typeof val === "number") return val;
      if (typeof val === "string" && /^\d+$/.test(val)) return Number(val);
      if (typeof val === "object") {
        const nested = findIdRecursive(val, seen);
        if (nested !== null) return nested;
      }
    }
  }

  for (const key in obj) {
    if (!keys.includes(key)) {
      const found = findIdRecursive(obj[key], seen);
      if (found !== null) return found;
    }
  }
  return null;
}

export function extractTripId(payload) {
  if (typeof payload === "number") return payload;
  if (typeof payload === "string" && /^\d+$/.test(payload)) return Number(payload);
  return findIdRecursive(payload);
}

export function extractBookingId(payload) {
  return extractTripId(payload);
}

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
