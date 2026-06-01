const STORAGE_KEY = "degy_conversations";

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

