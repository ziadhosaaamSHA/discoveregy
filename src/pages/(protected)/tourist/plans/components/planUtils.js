import { resolveApiAssetUrl } from "../../../../../services/api-client";

// parseBookingDateTime joins booking date and time into a valid Date for API payloads.
export function parseBookingDateTime(dateValue, timeValue) {
  const parsedDate = String(dateValue || "").trim();
  const parsedTime = String(timeValue || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(parsedDate)) return null;
  if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(parsedTime)) return null;
  const result = new Date(`${parsedDate}T${parsedTime}:00`);
  return Number.isNaN(result.getTime()) ? null : result;
}

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

// extractBookingId accepts several API response envelope shapes.
export function extractBookingId(payload) {
  if (typeof payload === "number") return payload;
  if (typeof payload === "string" && /^\d+$/.test(payload)) return Number(payload);
  return findIdRecursive(payload);
}

// mapPaymentMethod maps local booking copy to the API enum values.
export function mapPaymentMethod(value) {
  const normalized = String(value || "").toLowerCase();
  return normalized === "visa" ? "Visa" : "Cash";
}

export function extractArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

export function mapTripToPlan(trip) {
  const placeIds = Array.isArray(trip.placeIds) ? trip.placeIds : [];
  const price = Number(trip.price ?? trip.amount ?? 0);

  return {
    id: String(trip.id),
    tripId: trip.id,
    guideId: trip.guideId || null,
    guideName: trip.guideName || "",
    price: Number.isFinite(price) ? price : 0,
    title: {
      en: trip.title || `Trip ${trip.id}`,
      ar: trip.titleAr || trip.title || `رحلة ${trip.id}`,
    },
    description: {
      en: trip.description || "",
      ar: trip.descriptionAr || trip.description || "",
    },
    destinations: placeIds,
    image: resolveApiAssetUrl(trip.imageUrl),
  };
}

export function formatAmount(amount, language = "en") {
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) {
    return language === "ar" ? "سيتم التأكيد لاحقًا" : "To be confirmed";
  }
  return new Intl.NumberFormat(language === "ar" ? "ar-EG" : "en-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(value);
}

function createTimeOptions() {
  const options = [];
  for (let hour = 0; hour < 24; hour += 1) {
    for (let minute = 0; minute < 60; minute += 30) {
      const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      const period = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 || 12;
      const minuteLabel = String(minute).padStart(2, "0");
      options.push({ value, label: `${hour12}:${minuteLabel} ${period}` });
    }
  }
  return options;
}

export const TIME_OPTIONS = createTimeOptions();

export function readBookingInfo() {
  try {
    const parsed = JSON.parse(localStorage.getItem("user_booking_info") || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function getSavedStartTime() {
  const savedStartTime = String(readBookingInfo()?.startTime || "");
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(savedStartTime) ? savedStartTime : "";
}

export function getSavedDurationHours() {
  const savedDuration = Number(readBookingInfo()?.durationHours);
  return Number.isInteger(savedDuration) && savedDuration > 0 ? String(savedDuration) : "";
}
