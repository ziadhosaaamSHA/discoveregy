const STORAGE_KEY = "degy_conversations";

/**
 * Reads locally cached conversation metadata.
 * This is only a UI convenience cache; the backend remains the source of truth.
 */
export function readStoredConversations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

/**
 * Inserts or updates one locally cached conversation.
 * Used to keep conversation names visible while backend conversation lists refresh.
 */
export function upsertStoredConversation(conversation) {
  const current = readStoredConversations();
  const id = String(conversation?.id || "");
  if (!id) return current;

  const idx = current.findIndex((item) => String(item.id) === id);
  const next = { ...current[idx], ...conversation, id };

  if (idx >= 0) {
    current[idx] = next;
  } else {
    current.unshift(next);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  return current;
}

/**
 * Removes one locally cached conversation by id.
 */
export function removeStoredConversation(id) {
  const next = readStoredConversations().filter((item) => String(item.id) !== String(id));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

/**
 * Clears every locally cached conversation.
 */
export function clearStoredConversations() {
  localStorage.removeItem(STORAGE_KEY);
  return [];
}
