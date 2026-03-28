import { z } from 'zod';

export const UpdateBetslipSchema = z.object({
  totalStake: z.number().nonnegative().optional(),
  totalOdds: z.number().nonnegative().optional(),
  potentialPayout: z.number().nonnegative().optional(),
  acceptAnyOddsChange: z.boolean().optional(),
  acceptOnlyHigherOdds: z.boolean().optional(),
});

export type UpdateBetslipDTO = z.infer<typeof UpdateBetslipSchema>;
