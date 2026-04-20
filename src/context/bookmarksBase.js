import { createContext, useContext } from "react";

export const BookmarksContext = createContext(null);

export function useBookmarks() {
  const context = useContext(BookmarksContext);
  if (!context) {
    throw new Error("useBookmarks must be used within BookmarksProvider");
  }
  return context;
}
