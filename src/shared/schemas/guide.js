import { z } from "zod";

export const guideSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  userId: z.union([z.string(), z.number()]).optional(),
  guideId: z.union([z.string(), z.number()]).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  fullName: z.string().optional(),
  name: z.string().optional(),
  userName: z.string().optional(),
  guideName: z.string().optional(),
  specialty: z.string().optional(),
  specialtyAr: z.string().optional(),
  bio: z.string().optional(),
  rating: z.union([z.string(), z.number()]).optional(),
  averageRating: z.union([z.string(), z.number()]).optional(),
  profileImageUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  avatarUrl: z.string().optional(),
  photoUrl: z.string().optional(),
  languages: z.array(z.unknown()).optional(),
  languageNames: z.array(z.unknown()).optional(),
}).passthrough();
