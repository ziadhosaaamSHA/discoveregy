import { z } from "zod";

export const personSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  userId: z.union([z.string(), z.number()]).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  fullName: z.string().optional(),
  displayName: z.string().optional(),
  name: z.string().optional(),
  userName: z.string().optional(),
  username: z.string().optional(),
  email: z.string().optional(),
  imageUrl: z.string().optional(),
}).passthrough();

export const conversationSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  conversationId: z.union([z.string(), z.number()]).optional(),
  name: z.string().optional(),
  title: z.string().optional(),
  guideName: z.string().optional(),
  guideFullName: z.string().optional(),
  touristName: z.string().optional(),
  touristFullName: z.string().optional(),
  guideId: z.union([z.string(), z.number()]).optional(),
  touristId: z.union([z.string(), z.number()]).optional(),
  otherUserId: z.union([z.string(), z.number()]).optional(),
  guide: personSchema.optional(),
  tourist: personSchema.optional(),
  otherUser: personSchema.optional(),
  participant: personSchema.optional(),
  user: personSchema.optional(),
  lastMessage: z.string().optional(),
  latestMessage: z.string().optional(),
}).passthrough();

export const messageSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  content: z.string().optional(),
  text: z.string().optional(),
  isMine: z.boolean().optional(),
  senderId: z.union([z.string(), z.number()]).optional(),
  senderUserId: z.union([z.string(), z.number()]).optional(),
  receiverId: z.union([z.string(), z.number()]).optional(),
  receiverUserId: z.union([z.string(), z.number()]).optional(),
  senderType: z.string().optional(),
  senderRole: z.string().optional(),
  receiverType: z.string().optional(),
  receiverRole: z.string().optional(),
  createdAt: z.string().optional(),
  timestamp: z.string().optional(),
  sentAt: z.string().optional(),
}).passthrough();
