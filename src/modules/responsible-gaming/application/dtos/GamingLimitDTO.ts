import { z } from 'zod';

export const GamingLimitSchema = z.object({
  type: z.enum(['BET_AMOUNT', 'DEPOSIT_AMOUNT', 'TIME_ON_SITE']),
  dailyLimit: z.number().positive().nullable().optional(),
  weeklyLimit: z.number().positive().nullable().optional(),
  monthlyLimit: z.number().positive().nullable().optional(),
  reason: z.string().max(500).nullable().optional(),
});

export type GamingLimitDTO = z.infer<typeof GamingLimitSchema>;
