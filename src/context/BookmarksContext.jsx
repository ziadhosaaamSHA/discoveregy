/* eslint-disable react-refresh/only-export-components */
import { useState, useMemo, useCallback, useEffect } from "react";
import { BookmarksContext, useBookmarks } from "./bookmarksBase";
import { tourismApi } from "../services/tourism-api";
import { getAccessToken } from "../services/api-client";

const STORAGE_KEY = "degy_bookmarks";

export function BookmarksProvider({ children }) {
  const [bookmarks, setBookmarks] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    try {
      return stored ? JSON.parse(stored) : [];
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  });

  const saveToStorage = useCallback((newBookmarks) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newBookmarks));
  }, []);

  const extractFavoriteIds = useCallback((payload) => {
    const source = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(payload?.data)
          ? payload.data
          : [];

    return source
      .map((item) => {
        if (typeof item === "number") return item;
        if (typeof item?.placeId === "number") return item.placeId;
        if (typeof item?.id === "number") return item.id;
        return null;
      })
      .filter((id) => typeof id === "number");
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadFavorites = async () => {
      if (!getAccessToken()) return;

      try {
        const response = await tourismApi.getFavorites();
        const favoriteIds = extractFavoriteIds(response);
        if (!cancelled) {
          setBookmarks(favoriteIds);
          saveToStorage(favoriteIds);
        }
      } catch {
        // Keep local bookmarks when API favorites are unavailable.
      }
    };

    loadFavorites();
    return () => {
      cancelled = true;
    };
  }, [extractFavoriteIds, saveToStorage]);

  const updateBookmarks = useCallback((updater) => {
    setBookmarks((prev) => {
      const updated = updater(prev);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const addBookmark = useCallback((destinationId) => {
    updateBookmarks((prev) => {
      if (prev.includes(destinationId)) return prev;
      return [...prev, destinationId];
    });
    if (getAccessToken()) {
      tourismApi.addFavorite(destinationId).catch(() => {});
    }
  }, [updateBookmarks]);

  const removeBookmark = useCallback((destinationId) => {
    updateBookmarks((prev) => {
      return prev.filter((id) => id !== destinationId);
    });
    if (getAccessToken()) {
      tourismApi.removeFavorite(destinationId).catch(() => {});
    }
  }, [updateBookmarks]);

  const toggleBookmark = useCallback((destinationId) => {
    let shouldAdd = false;
    updateBookmarks((prev) => {
      const isBookmarked = prev.includes(destinationId);
      shouldAdd = !isBookmarked;
      return isBookmarked
        ? prev.filter((id) => id !== destinationId)
        : [...prev, destinationId];
    });
    if (getAccessToken()) {
      const request = shouldAdd
        ? tourismApi.addFavorite(destinationId)
        : tourismApi.removeFavorite(destinationId);
      request.catch(() => {});
    }
  }, [updateBookmarks]);

  const isBookmarked = useCallback(
    (destinationId) => bookmarks.includes(destinationId),
    [bookmarks]
  );

  const value = useMemo(
    () => ({
      bookmarks,
      addBookmark,
      removeBookmark,
      toggleBookmark,
      isBookmarked,
      bookmarkCount: bookmarks.length,
    }),
    [bookmarks, addBookmark, removeBookmark, toggleBookmark, isBookmarked]
  );

  return (
    <BookmarksContext.Provider value={value}>
      {children}
    </BookmarksContext.Provider>
  );
}

export { useBookmarks };
