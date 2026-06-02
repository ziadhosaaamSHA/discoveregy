import { resolveApiAssetUrl } from "../../services/api-client";
import { extractArray } from "../../shared/utils/api-shapes";
import { extractNumericId } from "../../shared/utils/ids";
import { guideSchema } from "../../shared/schemas/guide";

function normalizeLanguages(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((language) => {
      if (typeof language === "string") return language;
      if (!language || typeof language !== "object") return "";
      return language.name || language.nameEn || language.englishName || language.displayName || language.code || "";
    })
    .map((language) => String(language).trim())
    .filter(Boolean);
}

export function normalizeGuide(rawGuide) {
  const parsed = guideSchema.safeParse(rawGuide);
  const guide = parsed.success ? parsed.data : rawGuide;
  const id = String(guide?.id ?? guide?.userId ?? guide?.guideId ?? "");
  const firstName = guide?.firstName || "";
  const lastName = guide?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();
  const name = fullName || guide?.fullName || guide?.name || guide?.userName || guide?.guideName || "";
  const rating = Number(guide?.rating ?? guide?.averageRating);
  const image = resolveApiAssetUrl(guide?.profileImageUrl || guide?.imageUrl || guide?.avatarUrl || guide?.photoUrl || "");
  const languages = normalizeLanguages(guide?.languages || guide?.languageNames);

  return {
    id,
    name: { en: name, ar: name },
    specialty: {
      en: guide?.specialty || guide?.bio || "",
      ar: guide?.specialtyAr || guide?.specialty || guide?.bio || "",
    },
    rating: Number.isFinite(rating) ? rating.toFixed(1) : null,
    image,
    languages,
  };
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

export function extractBookingId(payload) {
  return extractNumericId(payload);
}

export function parseDateString(dateValue) {
  if (!dateValue || typeof dateValue !== "string") return null;
  const [day, month, year] = dateValue.split("/").map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day);
}

export function parseDurationDays(durationValue) {
  if (!durationValue || typeof durationValue !== "string") return 1;
  const match = durationValue.match(/\d+/);
  if (!match) return 1;
  const days = Number(match[0]);
  return Number.isFinite(days) && days > 0 ? days : 1;
}

export function mapPaymentMethod(value) {
  const normalized = String(value || "").toLowerCase();
  return normalized === "visa" ? "Visa" : "Cash";
}

export { extractArray };
