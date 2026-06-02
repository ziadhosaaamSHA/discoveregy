import { resolveApiAssetUrl } from "../api-client";

export function mapTripToPlan(trip) {
  const placeIds = Array.isArray(trip.placeIds) ? trip.placeIds : [];
  const price = Number(trip.price ?? trip.amount ?? 0);

  return {
    id: String(trip.id),
    tripId: trip.id,
    guideId: trip.guideId || null,
    guideName: trip.guideName || "",
    price: Number.isFinite(price) ? price : 0,
    title: {
      en: trip.title || `Trip ${trip.id}`,
      ar: trip.titleAr || trip.title || `رحلة ${trip.id}`,
    },
    description: {
      en: trip.description || "",
      ar: trip.descriptionAr || trip.description || "",
    },
    destinations: placeIds,
    image: resolveApiAssetUrl(trip.imageUrl),
  };
}
