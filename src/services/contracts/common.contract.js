import { z } from "zod";
import { unwrapPayload } from "../client";

// Shared primitive schemas used by multiple backend DTO contracts.
export const idSchema = z.union([z.string().min(1), z.number().int().positive()]);
export const nullableStringSchema = z.string().nullable().optional();
export const optionalStringSchema = z.string().optional();

// Generic backend envelope shape for endpoints that wrap payloads in data/result/items.
export const apiEnvelopeSchema = z
  .object({
    data: z.unknown().optional(),
    result: z.unknown().optional(),
    items: z.array(z.unknown()).optional(),
    message: z.string().optional(),
    title: z.string().optional(),
    error: z.string().optional(),
  })
  .passthrough();

/**
 * Returns the actual payload from a raw backend response.
 * Use this before mapping a single object response.
 */
export function extractPayload(data) {
  return unwrapPayload(data);
}

/**
 * Returns a list from the common response variants used by the backend.
 * Use this before mapping collection responses.
 */
export function extractArrayPayload(data) {
  const payload = unwrapPayload(data);
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.result)) return payload.result;
  return [];
}

/**
 * Formats one Zod validation issue into a developer-readable path message.
 */
function describeIssue(issue) {
  const path = issue.path.length ? issue.path.join(".") : "payload";
  return `${path}: ${issue.message}`;
}

/**
 * Validates any value against a Zod schema and throws a clear error if invalid.
 * Service functions use this before sending request bodies to the backend.
 */
export function parseWithSchema(schema, value, label = "API payload") {
  const result = schema.safeParse(value);
  if (result.success) return result.data;

  const message = result.error.issues.map(describeIssue).join("; ");
  throw new Error(`${label} is invalid. ${message}`);
}

/**
 * Extracts a list payload and validates every item against the provided schema.
 */
export function parseArrayWithSchema(schema, value, label = "API list") {
  const items = extractArrayPayload(value);
  return items.map((item, index) => parseWithSchema(schema, item, `${label}[${index}]`));
}

/**
 * Converts a loose value into a number when possible.
 * This is helpful for optional numeric backend fields from forms or query data.
 */
export function optionalNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}
