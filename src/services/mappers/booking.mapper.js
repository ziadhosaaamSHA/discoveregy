import { extractNumericId } from "../../shared/utils/ids";

export function extractTripId(payload) {
  return extractNumericId(payload);
}

export function extractBookingId(payload) {
  return extractNumericId(payload);
}

export function extractConversationId(payload) {
  if (typeof payload === "number") return payload;
  if (typeof payload === "string" && /^\d+$/.test(payload)) return Number(payload);
  if (!payload || typeof payload !== "object") return null;

  const candidates = [
    payload.id,
    payload.conversationId,
    payload.data?.id,
    payload.data?.conversationId,
    payload.result?.id,
    payload.result?.conversationId,
  ];

  for (const value of candidates) {
    if (typeof value === "number") return value;
    if (typeof value === "string" && /^\d+$/.test(value)) return Number(value);
  }

  return null;
}

export function mapPaymentMethod(value) {
  const normalized = String(value || "").toLowerCase();
  return normalized === "visa" ? "Visa" : "Cash";
}
