import { z } from 'zod';

const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/;
const phoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must have at least 2 characters'),
  displayName: z.string().optional(),
  email: z.string().email('Invalid email'),
  cpf: z.string().regex(cpfRegex, 'Invalid CPF'),
  phone: z.string().regex(phoneRegex, 'Invalid phone number'),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use format YYYY-MM-DD'),
  password: z.string().min(8, 'Password must have at least 8 characters'),
  acceptBonus: z.boolean().optional(),
});

export type RegisterDTO = z.infer<typeof registerSchema>;
