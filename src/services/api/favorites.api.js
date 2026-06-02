import { apiRequest } from "../api-client";

/**
 * Favorite endpoints are keyed by backend place ids.
 */
export const favoritesApi = {
  // Loads current user's favorite places.
  getFavorites: () => apiRequest("/api/favorites"),
  // Adds a place to favorites.
  addFavorite: (placeId) => apiRequest(`/api/favorites/${placeId}`, { method: "POST" }),
  // Removes a place from favorites.
  removeFavorite: (placeId) => apiRequest(`/api/favorites/${placeId}`, { method: "DELETE" }),
};
