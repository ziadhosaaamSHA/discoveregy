import { z } from "zod";

const tripSchema = z
  .object({
    title: z.string().nullable().optional(),
    destination: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    numberOfPeople: z.union([z.string(), z.number()]).nullable().optional(),
  })
  .passthrough();

const touristSchema = z
  .object({
    name: z.string().nullable().optional(),
    fullName: z.string().nullable().optional(),
    userName: z.string().nullable().optional(),
  })
  .passthrough();

export const guideRequestSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    requestId: z.union([z.string(), z.number()]).optional(),
    touristName: z.string().nullable().optional(),
    touristId: z.union([z.string(), z.number()]).nullable().optional(),
    tourist: touristSchema.nullable().optional(),
    userName: z.string().nullable().optional(),
    tripType: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
    trip: tripSchema.nullable().optional(),
    location: z.string().nullable().optional(),
    destination: z.string().nullable().optional(),
    date: z.string().nullable().optional(),
    startDate: z.string().nullable().optional(),
    createdAt: z.string().nullable().optional(),
    people: z.union([z.string(), z.number()]).nullable().optional(),
    numberOfPeople: z.union([z.string(), z.number()]).nullable().optional(),
    conversationId: z.union([z.string(), z.number()]).nullable().optional(),
    conversation: z.object({ id: z.union([z.string(), z.number()]).optional() }).passthrough().nullable().optional(),
    status: z.string().nullable().optional(),
  })
  .passthrough();
