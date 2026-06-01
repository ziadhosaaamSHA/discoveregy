import { DESTINATIONS } from "../data/destinations";
import { tourismApi } from "./tourism-api";
import { resolveApiAssetUrl } from "./api-client";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1539650116574-8efeb43e2b50?auto=format&fit=crop&q=80&w=800";

const DEFAULT_DURATION = { en: "2-3 hours", ar: "٢-٣ ساعات" };
const baseUrl = "https://tourism-api-sha-e7g5guagcdc2dddv.westeurope-01.azurewebsites.net"

let destinationsCache = null;
let inflightRequest = null;

function normalizePrice(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `$${value}`;
  }
  return null;
}

function mapApiPlace(place, staticDestination) {
  const base = staticDestination || {};
  const enCopy = base.copy?.en || {};
  const arCopy = base.copy?.ar || {};

  const apiName = place?.name || place?.Name || enCopy.name || "Unknown place";
  const apiNameAr = place?.nameAr || place?.NameAr || arCopy.name || apiName;

  const apiLocation = place?.city || place?.City || enCopy.location || "Egypt";
  const apiLocationAr = place?.cityAr || place?.CityAr || arCopy.location || apiLocation;

  const apiDescription = place?.description || place?.Description || enCopy.description || "";
  const apiDescriptionAr = place?.descriptionAr || place?.DescriptionAr || arCopy.description || apiDescription;

  const categoryName = place?.categoryName || place?.CategoryName || base.category || "cultural";
  const categoryNameAr = place?.categoryNameAr || place?.CategoryNameAr || categoryName;

  return {
    id: place?.id ?? base.id,
    image: resolveApiAssetUrl(place?.imageUrl || place?.ImageUrl) || base.image || FALLBACK_IMAGE,
    videoUrl: resolveApiAssetUrl(place?.videoUrl || place?.videoURL || place?.VideoUrl || place?.VideoURL) || base.videoUrl || null,
    price: normalizePrice(place?.ticketPrice ?? place?.TicketPrice) || base.price || "$0",
    duration: base.duration || DEFAULT_DURATION,
    rating: base.rating ?? 4.5,
    reviews: base.reviews ?? 0,
    category: categoryName,
    copy: {
      en: {
        ...enCopy,
        name: apiName,
        location: apiLocation,
        description: apiDescription || enCopy.description || "Discover one of Egypt's unique destinations.",
        categoryName: categoryName,
      },
      ar: {
        ...arCopy,
        name: apiNameAr,
        location: apiLocationAr,
        description: apiDescriptionAr || arCopy.description || apiDescription || "اكتشف واحدة من وجهات مصر المميزة.",
        categoryName: categoryNameAr,
      },
    },
  };
}

function mergeDestinations(apiPlaces) {
  const byId = new Map(DESTINATIONS.map((destination) => [destination.id, destination]));

  for (const place of apiPlaces) {
    if (!place || typeof place.id !== "number") continue;
    const current = byId.get(place.id);
    byId.set(place.id, mapApiPlace(place, current));
  }

  return Array.from(byId.values()).sort((a, b) => a.id - b.id);
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
  return DESTINATIONS;
}
