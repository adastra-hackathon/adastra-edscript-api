import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or CPF required'),
  password: z.string().min(1, 'Password required'),
});

export type LoginDTO = z.infer<typeof loginSchema>;
