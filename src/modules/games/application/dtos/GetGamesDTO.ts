import { z } from 'zod';

export const GetGamesQuerySchema = z.object({
  type: z.enum(['CASINO', 'LIVE_CASINO']).optional(),
  search: z.string().max(100).optional(),
  providers: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => (v ? (Array.isArray(v) ? v : [v]) : undefined)),
  categories: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => (v ? (Array.isArray(v) ? v : [v]) : undefined)),
  sort: z.enum(['default', 'a-z', 'new']).optional().default('default'),
  page: z
    .string()
    .optional()
    .transform((v) => (v ? Math.max(1, parseInt(v, 10)) : 1)),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? Math.min(100, Math.max(1, parseInt(v, 10))) : 20)),
});

export type GetGamesQuery = z.infer<typeof GetGamesQuerySchema>;
