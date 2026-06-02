import {
  bookingsApi,
  chatApi,
  favoritesApi,
  guideRequestsApi,
  nationalitiesApi,
  notificationsApi,
  placesApi,
  reviewsApi,
  rolesApi,
  tripsApi,
  usersApi,
  communityApi,
} from "./api";

// Backward-compatible aggregate used by existing pages.
// New tourism endpoint work should usually go into the matching file in src/services/api.
export const tourismApi = {
  ...tripsApi,
  ...placesApi,
  ...favoritesApi,
  ...nationalitiesApi,
  ...guideRequestsApi,
  ...chatApi,
  ...usersApi,
  ...bookingsApi,
  ...notificationsApi,
  ...rolesApi,
  ...reviewsApi,
  ...communityApi,
};

