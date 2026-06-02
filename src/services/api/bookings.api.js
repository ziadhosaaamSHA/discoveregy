import { apiRequest, getActiveAuthRole } from "../api-client";
import {
  validateCancelBookingRequest,
  validateCreateBookingRequest,
  validatePayRequest,
  validateRefundRequest,
} from "../contracts";

/**
 * Booking endpoints include payment actions because payment always depends on a booking id.
 */
export const bookingsApi = {
  // Creates a booking for a predefined or custom trip.
  createBooking: (payload) =>
    apiRequest("/api/bookings", { method: "POST", body: validateCreateBookingRequest(payload) }),
  // Loads bookings for the active role; guides use their assigned bookings endpoint.
  getBookings: () => apiRequest(getActiveAuthRole() === "guide" ? "/api/bookings/guide" : "/api/bookings/my"),
  // Admin-only list of every booking.
  getAllBookings: () => apiRequest("/api/bookings/all"),
  // Loads one booking detail record.
  getBookingById: (id) => apiRequest(`/api/bookings/${id}`),
  // Cancels a booking with an optional reason.
  cancelBooking: (id, payload) =>
    apiRequest(`/api/bookings/${id}/cancel`, { method: "PUT", body: validateCancelBookingRequest(payload) }),
  // Confirms a booking, usually by guide/admin workflow.
  confirmBooking: (id) => apiRequest(`/api/bookings/${id}/confirm`, { method: "PUT" }),
  // Creates payment for an existing booking.
  payBooking: (payload) => apiRequest("/api/payments/pay", { method: "POST", body: validatePayRequest(payload) }),
  // Refunds a paid booking.
  refundBooking: (payload) => apiRequest("/api/payments/refund", { method: "POST", body: validateRefundRequest(payload) }),
  // Loads payment details by booking id.
  getPaymentByBooking: (bookingId) => apiRequest(`/api/payments/booking/${bookingId}`),
};
