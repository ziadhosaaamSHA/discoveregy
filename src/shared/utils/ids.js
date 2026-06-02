export function findIdRecursive(obj, seen = new Set()) {
  if (!obj || typeof obj !== "object" || seen.has(obj)) return null;
  seen.add(obj);

  const keys = ["id", "tripId", "bookingId", "value", "data", "result", "trip", "booking"];
  for (const key of keys) {
    const val = obj[key];
    if (val !== undefined && val !== null) {
      if (typeof val === "number") return val;
      if (typeof val === "string" && /^\d+$/.test(val)) return Number(val);
      if (typeof val === "object") {
        const nested = findIdRecursive(val, seen);
        if (nested !== null) return nested;
      }
    }
  }

  for (const key in obj) {
    if (!keys.includes(key)) {
      const found = findIdRecursive(obj[key], seen);
      if (found !== null) return found;
    }
  }

  return null;
}

export function extractNumericId(payload) {
  if (typeof payload === "number") return payload;
  if (typeof payload === "string" && /^\d+$/.test(payload)) return Number(payload);
  return findIdRecursive(payload);
}
