import { resolveApiAssetUrl } from "../api-client";
import { parseWithSchema, placeResponseSchema } from "../contracts";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1539650116574-8efeb43e2b50?auto=format&fit=crop&q=80&w=800";

const DEFAULT_DURATION = { en: "2-3 hours", ar: "٢-٣ ساعات" };

/**
 * Formats a raw numeric place ticket value for display.
 */
export function normalizePlacePrice(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? `${numeric} EGP` : null;
}

/**
 * Parses a backend ticket price into a non-negative number for payment totals.
 */
export function normalizeTicketPrice(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 0;
}

/**
 * Reads a ticket price from mapped destinations or raw backend place objects.
 * This keeps custom-plan payment totals consistent across both shapes.
 */
export function readTicketPrice(place) {
  const ticketPrice = normalizeTicketPrice(place?.ticketPrice ?? place?.TicketPrice);
  if (ticketPrice > 0) return ticketPrice;

  const priceText = String(place?.price || "");
  const parsedPrice = Number(priceText.replace(/[^\d.]/g, ""));
  return Number.isFinite(parsedPrice) ? Math.max(0, parsedPrice) : 0;
}

/**
 * Reads the first valid coordinate from possible backend key variants.
 */
export function readCoordinate(...values) {
  for (const value of values) {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
  }
  return null;
}

/**
 * Returns normalized latitude/longitude from a backend or mapped place object.
 */
export function readPlaceCoordinates(place) {
  return {
    latitude: readCoordinate(place?.latitude, place?.Latitude, place?.lat, place?.Lat),
    longitude: readCoordinate(place?.longitude, place?.Longitude, place?.lng, place?.Lng),
  };
}

/**
 * Reads a backend place id from casing/id-key variants.
 */
export function readPlaceId(place) {
  const rawId = place?.id ?? place?.Id ?? place?.placeId ?? place?.PlaceId;
  const numericId = Number(rawId);
  return Number.isFinite(numericId) ? numericId : rawId;
}

/**
 * Converts a backend place response into the destination-card model used by tourist pages.
 */
export function mapApiPlace(place) {
  const parsedPlace = parseWithSchema(placeResponseSchema, place, "Place response");
  const placeId = readPlaceId(parsedPlace);
  const { latitude, longitude } = readPlaceCoordinates(parsedPlace);

  const apiName = parsedPlace?.name || parsedPlace?.Name || "Unknown place";
  const apiNameAr = parsedPlace?.nameAr || parsedPlace?.NameAr || apiName;

  const apiLocation = parsedPlace?.city || parsedPlace?.City || "Egypt";
  const apiLocationAr = parsedPlace?.cityAr || parsedPlace?.CityAr || apiLocation;

  const apiDescription = parsedPlace?.description || parsedPlace?.Description || "";
  const apiDescriptionAr = parsedPlace?.descriptionAr || parsedPlace?.DescriptionAr || apiDescription;

  const categoryName = parsedPlace?.categoryName || parsedPlace?.CategoryName || "cultural";
  const categoryNameAr = parsedPlace?.categoryNameAr || parsedPlace?.CategoryNameAr || categoryName;
  const rawTicketPrice = parsedPlace?.ticketPrice ?? parsedPlace?.TicketPrice;

  return {
    id: placeId,
    image: resolveApiAssetUrl(parsedPlace?.imageUrl || parsedPlace?.ImageUrl) || FALLBACK_IMAGE,
    videoUrl: resolveApiAssetUrl(parsedPlace?.videoUrl || parsedPlace?.videoURL || parsedPlace?.VideoUrl || parsedPlace?.VideoURL) || null,
    ticketPrice: normalizeTicketPrice(rawTicketPrice),
    price: normalizePlacePrice(rawTicketPrice) || "0 EGP",
    latitude,
    longitude,
    duration: DEFAULT_DURATION,
    rating: 4.5,
    reviews: 0,
    category: categoryName,
    copy: {
      en: {
        name: apiName,
        location: apiLocation,
        description: apiDescription || "Discover one of Egypt's unique destinations.",
        categoryName,
      },
      ar: {
        name: apiNameAr,
        location: apiLocationAr,
        description: apiDescriptionAr || apiDescription || "اكتشف واحدة من وجهات مصر المميزة.",
        categoryName: categoryNameAr,
      },
    },
  };
}

/**
 * Maps and sorts a list of backend places for destination grids.
 */
export function mapApiPlaces(places) {
  return places
    .filter((place) => place && readPlaceId(place) !== undefined && readPlaceId(place) !== null)
    .map(mapApiPlace)
    .sort((a, b) => Number(a.id) - Number(b.id));
}
