// extractArray normalizes common API envelope shapes into a list.
export function extractArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

// normalizeGuide converts guide/user API records into the GuideCard view model.
export function normalizeGuide(guide) {
  const id = String(guide?.id ?? guide?.userId ?? guide?.guideId ?? "");
  const firstName = guide?.firstName || "";
  const lastName = guide?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();
  const name = fullName || guide?.fullName || guide?.name || guide?.userName || guide?.guideName || "Guide";

  return {
    id,
    name: { en: name, ar: name },
    specialty: {
      en: guide?.specialty || guide?.bio || "Local Guide",
      ar: guide?.specialty || guide?.bio || "مرشد سياحي",
    },
    rating: Number(guide?.rating || 4.8).toFixed(1),
    image:
      guide?.profileImageUrl ||
      guide?.imageUrl ||
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    languages: Array.isArray(guide?.languages) && guide.languages.length ? guide.languages : ["English", "Arabic"],
  };
}

// extractConversationId finds the conversation id from varied chat response shapes.
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

// extractBookingId finds a booking or trip id from varied booking response shapes.
export function extractBookingId(payload) {
  if (typeof payload === "number") return payload;
  if (typeof payload === "string" && /^\d+$/.test(payload)) return Number(payload);
  return findIdRecursive(payload);
}

// parseDateString converts the saved dd/mm/yyyy booking value into a Date.
export function parseDateString(dateValue) {
  if (!dateValue || typeof dateValue !== "string") return null;
  const [day, month, year] = dateValue.split("/").map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day);
}

// parseDurationDays extracts a numeric day count from the saved duration label.
export function parseDurationDays(durationValue) {
  if (!durationValue || typeof durationValue !== "string") return 1;
  const match = durationValue.match(/\d+/);
  if (!match) return 1;
  const days = Number(match[0]);
  return Number.isFinite(days) && days > 0 ? days : 1;
}

// mapPaymentMethod maps local payment labels to the API's expected values.
export function mapPaymentMethod(value) {
  const normalized = String(value || "").toLowerCase();
  return normalized === "visa" ? "Visa" : "Cash";
}
