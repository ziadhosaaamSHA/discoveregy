import { z } from "zod";

export const looseObjectSchema = z.object({}).passthrough();

export function parseLooseObject(value, fallback = {}) {
  const parsed = looseObjectSchema.safeParse(value);
  return parsed.success ? parsed.data : fallback;
}

export function parseArrayWith(schema, value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => schema.safeParse(item))
    .filter((result) => result.success)
    .map((result) => result.data);
}
