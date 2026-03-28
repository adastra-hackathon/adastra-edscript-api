import { z } from 'zod';

export const TimedSelfExclusionSchema = z.object({
  untilDate: z.string().datetime({ message: 'Data inválida. Use o formato ISO.' }),
  reason: z.string().max(500).nullable().optional(),
});

export const SelfExclusionSchema = z.object({
  duration: z.enum(['3_MONTHS', '6_MONTHS', '1_YEAR', '2_YEARS', 'PERMANENT']).nullable(),
  reason: z.string().max(500).nullable().optional(),
});

export type TimedSelfExclusionDTO = z.infer<typeof TimedSelfExclusionSchema>;
export type SelfExclusionDTO = z.infer<typeof SelfExclusionSchema>;
