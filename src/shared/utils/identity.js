export function normalizeRole(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized.includes("guide")) return "guide";
  if (normalized.includes("admin")) return "admin";
  if (normalized.includes("tourist") || normalized.includes("tour")) return "tourist";
  return "";
}

export function readId(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value);
    }
  }
  return "";
}

export function readName(...values) {
  for (const value of values) {
    const text = String(value || "").trim();
    if (text && !/^conversation\s+\d+$/i.test(text)) return text;
  }
  return "";
}

export function readPersonName(person) {
  if (!person || typeof person !== "object") return "";
  const fullName = `${person.firstName || ""} ${person.lastName || ""}`.trim();
  return readName(
    fullName,
    person.fullName,
    person.displayName,
    person.name,
    person.userName,
    person.username,
    person.email
  );
}

export function isFallbackConversationName(name, id) {
  const text = String(name || "").trim();
  return !text || text.toLowerCase() === `conversation ${id}`.toLowerCase();
}
