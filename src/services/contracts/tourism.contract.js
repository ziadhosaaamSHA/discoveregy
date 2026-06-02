import { z } from "zod";
import { idSchema, parseWithSchema } from "./common.contract";

// Numeric DTO fields often arrive from forms as strings, so request schemas coerce safely.
const intSchema = z.coerce.number().int();
const positiveIntSchema = intSchema.positive();
const optionalPositiveNumberSchema = z.coerce.number().positive().optional();

// Backend payment enum from apis.json.
export const paymentMethodSchema = z.enum(["Cash", "Visa"]);

// Booking creation contract used by normal trips and custom-plan bookings.
export const createBookingRequestSchema = z
  .object({
    planId: positiveIntSchema.optional(),
    guideId: idSchema.nullable().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    numberOfPeople: positiveIntSchema.optional(),
    paymentMethod: paymentMethodSchema.optional(),
    usePoints: z.boolean().optional(),
  })
  .passthrough();

// Booking cancellation allows an optional reason.
export const cancelBookingRequestSchema = z
  .object({
    reason: z.string().nullable().optional(),
  })
  .passthrough();

// Payment requires a backend booking id.
export const payRequestSchema = z
  .object({
    bookingId: positiveIntSchema,
  })
  .passthrough();

// Refunds require reason and booking id; amount is optional for full refunds.
export const refundRequestSchema = z
  .object({
    bookingId: positiveIntSchema,
    reason: z.string().min(1),
    amount: optionalPositiveNumberSchema.nullable(),
  })
  .passthrough();

// Conversation creation starts a chat with one guide.
export const createConversationRequestSchema = z
  .object({
    guideId: idSchema,
  })
  .passthrough();

// Messages require a conversation id and text content; attachments are allowed by passthrough.
export const createMessageRequestSchema = z
  .object({
    conversationId: positiveIntSchema,
    content: z.string().min(1).max(2000),
  })
  .passthrough();

// Guide requests connect a guide to a trip selected by a tourist.
export const createGuideRequestSchema = z
  .object({
    tripId: positiveIntSchema,
    guideId: idSchema,
  })
  .passthrough();

// Admin guide rejection requires a reason that can be shown later.
export const rejectGuideRequestSchema = z
  .object({
    reason: z.string().min(1),
  })
  .passthrough();

// User role assignment/removal uses the same backend DTO.
export const assignRoleRequestSchema = z
  .object({
    roleName: z.string().min(1),
  })
  .passthrough();

// Nationality create/update fields used by admin and signup support.
export const createNationalityRequestSchema = z
  .object({
    name: z.string().min(1).max(100),
    nameAr: z.string().nullable().optional(),
  })
  .passthrough();

// Notification broadcast payload used from admin dashboard.
export const createNotificationRequestSchema = z
  .object({
    title: z.string().min(1).max(200),
    content: z.string().min(1).max(1000),
  })
  .passthrough();

// Role creation is currently loose because backend accepts nullable names.
export const createRoleRequestSchema = z
  .object({
    name: z.string().nullable().optional(),
  })
  .passthrough();

// Place review creation contract.
export const createPlaceReviewRequestSchema = z
  .object({
    placeId: positiveIntSchema,
    rating: intSchema.min(1).max(5).optional(),
    comment: z.string().min(1).max(1000),
  })
  .passthrough();

// Place review update contract.
export const updatePlaceReviewRequestSchema = z
  .object({
    rating: intSchema.min(1).max(5).optional(),
    comment: z.string().min(1).max(1000),
  })
  .passthrough();

// Place responses support both camelCase and PascalCase because backend/admin forms vary.
export const placeResponseSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    Id: z.union([z.string(), z.number()]).optional(),
    placeId: z.union([z.string(), z.number()]).optional(),
    PlaceId: z.union([z.string(), z.number()]).optional(),
    name: z.string().nullable().optional(),
    Name: z.string().nullable().optional(),
    nameAr: z.string().nullable().optional(),
    NameAr: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    City: z.string().nullable().optional(),
    cityAr: z.string().nullable().optional(),
    CityAr: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    Description: z.string().nullable().optional(),
    descriptionAr: z.string().nullable().optional(),
    DescriptionAr: z.string().nullable().optional(),
    imageUrl: z.string().nullable().optional(),
    ImageUrl: z.string().nullable().optional(),
    videoUrl: z.string().nullable().optional(),
    VideoUrl: z.string().nullable().optional(),
    ticketPrice: z.union([z.string(), z.number()]).nullable().optional(),
    TicketPrice: z.union([z.string(), z.number()]).nullable().optional(),
    latitude: z.union([z.string(), z.number()]).nullable().optional(),
    longitude: z.union([z.string(), z.number()]).nullable().optional(),
  })
  .passthrough();

/** Validates a booking creation request before POST /api/bookings. */
export function validateCreateBookingRequest(payload) {
  return parseWithSchema(createBookingRequestSchema, payload, "Create booking request");
}

/** Validates a booking cancellation request before PUT /api/bookings/:id/cancel. */
export function validateCancelBookingRequest(payload) {
  return parseWithSchema(cancelBookingRequestSchema, payload || {}, "Cancel booking request");
}

/** Validates a payment request before POST /api/payments/pay. */
export function validatePayRequest(payload) {
  return parseWithSchema(payRequestSchema, payload, "Payment request");
}

/** Validates a refund request before POST /api/payments/refund. */
export function validateRefundRequest(payload) {
  return parseWithSchema(refundRequestSchema, payload, "Refund request");
}

/** Validates a conversation creation request before POST /api/conversations. */
export function validateCreateConversationRequest(payload) {
  return parseWithSchema(createConversationRequestSchema, payload, "Create conversation request");
}

/** Validates a message request before POST /api/messages. */
export function validateCreateMessageRequest(payload) {
  return parseWithSchema(createMessageRequestSchema, payload, "Create message request");
}

/** Validates a tourist-to-guide trip request before POST /api/requests. */
export function validateCreateGuideRequest(payload) {
  return parseWithSchema(createGuideRequestSchema, payload, "Create guide request");
}

/** Validates admin guide rejection before PUT /api/users/guides/:id/reject. */
export function validateRejectGuideRequest(payload) {
  return parseWithSchema(rejectGuideRequestSchema, payload, "Reject guide request");
}

/** Validates roleName payloads for assign/remove role endpoints. */
export function validateAssignRoleRequest(payload) {
  return parseWithSchema(assignRoleRequestSchema, payload, "Assign role request");
}

/** Validates nationality create/update payloads. */
export function validateCreateNationalityRequest(payload) {
  return parseWithSchema(createNationalityRequestSchema, payload, "Nationality request");
}

/** Validates admin notification creation payloads. */
export function validateCreateNotificationRequest(payload) {
  return parseWithSchema(createNotificationRequestSchema, payload, "Notification request");
}

/** Validates role creation payloads. */
export function validateCreateRoleRequest(payload) {
  return parseWithSchema(createRoleRequestSchema, payload, "Role request");
}

/** Validates place review creation payloads. */
export function validateCreatePlaceReviewRequest(payload) {
  return parseWithSchema(createPlaceReviewRequestSchema, payload, "Create review request");
}

/** Validates place review update payloads. */
export function validateUpdatePlaceReviewRequest(payload) {
  return parseWithSchema(updatePlaceReviewRequestSchema, payload, "Update review request");
}
