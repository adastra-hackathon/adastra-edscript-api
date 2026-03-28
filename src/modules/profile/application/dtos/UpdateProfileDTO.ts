import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().min(3).max(100).optional(),
  displayName: z.string().min(2).max(50).optional(),
  phone: z.string().min(10).max(20).optional(),
  gender: z.string().max(20).optional(),
  address: z.string().max(200).optional(),
});

export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>;
