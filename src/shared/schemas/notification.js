import { z } from "zod";

export const notificationSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    notificationId: z.union([z.string(), z.number()]).optional(),
    title: z.string().nullable().optional(),
    subject: z.string().nullable().optional(),
    message: z.string().nullable().optional(),
    body: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
    createdAt: z.string().nullable().optional(),
    date: z.string().nullable().optional(),
    timestamp: z.string().nullable().optional(),
    isRead: z.boolean().optional(),
    read: z.boolean().optional(),
    status: z.string().nullable().optional(),
  })
  .passthrough();
