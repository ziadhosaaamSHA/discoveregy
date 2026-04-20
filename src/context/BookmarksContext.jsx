import { useState, useMemo, useCallback } from "react";
import { BookmarksContext, useBookmarks } from "./bookmarksBase";

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

  const addBookmark = useCallback((destinationId) => {
    setBookmarks((prev) => {
      if (prev.includes(destinationId)) return prev;
      const updated = [...prev, destinationId];
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const removeBookmark = useCallback((destinationId) => {
    setBookmarks((prev) => {
      const updated = prev.filter((id) => id !== destinationId);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const toggleBookmark = useCallback((destinationId) => {
    setBookmarks((prev) => {
      const isBookmarked = prev.includes(destinationId);
      const updated = isBookmarked
        ? prev.filter((id) => id !== destinationId)
        : [...prev, destinationId];
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

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
