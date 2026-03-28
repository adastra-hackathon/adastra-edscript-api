import { z } from 'zod';

export const TimedExclusionSchema = z.object({
  excludeUntil: z.string().datetime({ message: 'Data inválida' }),
  reason: z.string().max(500).nullable().optional(),
});

export const AutoExclusionSchema = z.object({
  autoPeriod: z.enum(['3_MONTHS', '6_MONTHS', '1_YEAR', '2_YEARS', 'PERMANENT']).nullable(),
  reason: z.string().max(500).nullable().optional(),
});

export type TimedExclusionDTO = z.infer<typeof TimedExclusionSchema>;
export type AutoExclusionDTO = z.infer<typeof AutoExclusionSchema>;
