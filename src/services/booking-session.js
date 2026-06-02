const BOOKING_INFO_KEY = "user_booking_info";
const CURRENT_BOOKING_PLAN_KEY = "current_booking_plan";
const CURRENT_BOOKING_ID_KEY = "current_booking_id";
const SELECTED_GUIDE_KEY = "selected_guide";
const UPCOMING_TRIPS_KEY = "upcoming_trips";

function readJson(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    return parsed && typeof parsed === "object" ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  return value;
}

export function readBookingInfo() {
  return readJson(BOOKING_INFO_KEY, {});
}

export function saveBookingInfo(nextInfo) {
  return writeJson(BOOKING_INFO_KEY, nextInfo || {});
}

export function mergeBookingInfo(patch) {
  return saveBookingInfo({ ...readBookingInfo(), ...patch });
}

export function getSavedStartTime() {
  const savedStartTime = String(readBookingInfo()?.startTime || "");
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(savedStartTime) ? savedStartTime : "";
}

export function getSavedDurationHours() {
  const savedDuration = Number(readBookingInfo()?.durationHours);
  return Number.isInteger(savedDuration) && savedDuration > 0 ? String(savedDuration) : "";
}

export function readCurrentBookingPlan() {
  return readJson(CURRENT_BOOKING_PLAN_KEY, {});
}

export function saveCurrentBookingPlan(plan) {
  return writeJson(CURRENT_BOOKING_PLAN_KEY, plan || {});
}

export function readSelectedTripId() {
  const bookingPlan = readCurrentBookingPlan();
  const numeric = Number(bookingPlan?.tripId ?? bookingPlan?.planId);
  return Number.isFinite(numeric) ? numeric : null;
}

export function readCurrentBookingId() {
  return localStorage.getItem(CURRENT_BOOKING_ID_KEY);
}

export function saveCurrentBookingId(id) {
  if (id === undefined || id === null || id === "") return null;
  localStorage.setItem(CURRENT_BOOKING_ID_KEY, String(id));
  return String(id);
}

export function clearCurrentBookingId() {
  localStorage.removeItem(CURRENT_BOOKING_ID_KEY);
}

export function saveSelectedGuide(guide) {
  return writeJson(SELECTED_GUIDE_KEY, guide || {});
}

export function clearSelectedGuide() {
  localStorage.removeItem(SELECTED_GUIDE_KEY);
}

export function readUpcomingTrips() {
  const trips = readJson(UPCOMING_TRIPS_KEY, []);
  return Array.isArray(trips) ? trips : [];
}

export function addUpcomingTrip(trip) {
  const nextTrips = [...readUpcomingTrips(), trip];
  writeJson(UPCOMING_TRIPS_KEY, nextTrips);
  return nextTrips;
}
