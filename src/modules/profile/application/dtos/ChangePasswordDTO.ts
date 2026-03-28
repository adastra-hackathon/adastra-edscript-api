import { z } from 'zod';

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
  confirmPassword: z.string().min(1),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'As senhas não conferem.',
  path: ['confirmPassword'],
});

export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>;
