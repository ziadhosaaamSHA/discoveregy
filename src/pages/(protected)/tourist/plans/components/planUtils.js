import {
  getSavedDurationHours,
  getSavedStartTime,
  readBookingInfo,
} from "../../../../../services/booking-session";
import { extractBookingId, mapPaymentMethod } from "../../../../../services/mappers/booking.mapper";
import { mapTripToPlan } from "../../../../../services/mappers/trip.mapper";
import { parseBookingDateTime } from "../../../../../shared/utils/dates";
import { extractArray } from "../../../../../shared/utils/api-shapes";
import { formatAmount } from "../../../../../shared/utils/money";

export { extractArray, extractBookingId, formatAmount, getSavedDurationHours, getSavedStartTime, mapPaymentMethod, mapTripToPlan, parseBookingDateTime, readBookingInfo };

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
