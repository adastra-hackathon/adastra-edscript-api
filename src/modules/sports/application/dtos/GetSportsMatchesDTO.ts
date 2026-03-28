import { z } from 'zod';

export const GetSportsMatchesQuerySchema = z.object({
  sport: z.string().optional(),
  isLive: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
});

export type GetSportsMatchesQuery = z.infer<typeof GetSportsMatchesQuerySchema>;
