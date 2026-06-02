import { tourismApi } from "./tourism-api";
import { resolveApiAssetUrl } from "./api-client";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1539650116574-8efeb43e2b50?auto=format&fit=crop&q=80&w=800";

const DEFAULT_DURATION = { en: "2-3 hours", ar: "٢-٣ ساعات" };

let destinationsCache = null;
let inflightRequest = null;

function normalizePrice(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `$${value}`;
  }
  return null;
}

function readPlaceId(place) {
  const rawId = place?.id ?? place?.Id ?? place?.placeId ?? place?.PlaceId;
  const numericId = Number(rawId);
  return Number.isFinite(numericId) ? numericId : rawId;
}

function mapApiPlace(place) {
  const placeId = readPlaceId(place);

  const apiName = place?.name || place?.Name || "Unknown place";
  const apiNameAr = place?.nameAr || place?.NameAr || apiName;

  const apiLocation = place?.city || place?.City || "Egypt";
  const apiLocationAr = place?.cityAr || place?.CityAr || apiLocation;

  const apiDescription = place?.description || place?.Description || "";
  const apiDescriptionAr = place?.descriptionAr || place?.DescriptionAr || apiDescription;

  const categoryName = place?.categoryName || place?.CategoryName || "cultural";
  const categoryNameAr = place?.categoryNameAr || place?.CategoryNameAr || categoryName;

  return {
    id: placeId,
    image: resolveApiAssetUrl(place?.imageUrl || place?.ImageUrl) || FALLBACK_IMAGE,
    videoUrl: resolveApiAssetUrl(place?.videoUrl || place?.videoURL || place?.VideoUrl || place?.VideoURL) || null,
    price: normalizePrice(place?.ticketPrice ?? place?.TicketPrice) || "$0",
    duration: DEFAULT_DURATION,
    rating: 4.5,
    reviews: 0,
    category: categoryName,
    copy: {
      en: {
        name: apiName,
        location: apiLocation,
        description: apiDescription || "Discover one of Egypt's unique destinations.",
        categoryName: categoryName,
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

function mergeDestinations(apiPlaces) {
  return apiPlaces
    .filter((place) => place && readPlaceId(place) !== undefined && readPlaceId(place) !== null)
    .map(mapApiPlace)
    .sort((a, b) => Number(a.id) - Number(b.id));
}

function extractArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

export async function fetchDestinations(options = {}) {
  const { force = false } = options;

  if (!force && destinationsCache) return destinationsCache;
  if (!force && inflightRequest) return inflightRequest;

  inflightRequest = (async () => {
    const response = await tourismApi.getPlaces();
    const apiPlaces = extractArray(response);
    const merged = mergeDestinations(apiPlaces);
    destinationsCache = merged;
    return merged;
  })();

  try {
    return await inflightRequest;
  } finally {
    inflightRequest = null;
  }
}

export function getFallbackDestinations() {
  return [];
}
