import { z } from 'zod';

export const SessionTimeLimitSchema = z
  .object({
    dailyMinutes: z.number().int().positive().nullable().optional(),
    weeklyMinutes: z.number().int().positive().nullable().optional(),
    monthlyMinutes: z.number().int().positive().nullable().optional(),
    reason: z.string().max(500).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    const { dailyMinutes: d, weeklyMinutes: w, monthlyMinutes: m } = data;
    if (d && w && w < d) {
      ctx.addIssue({ code: 'custom', path: ['weeklyMinutes'], message: 'Limite semanal não pode ser menor que o diário.' });
    }
    if (w && m && m < w) {
      ctx.addIssue({ code: 'custom', path: ['monthlyMinutes'], message: 'Limite mensal não pode ser menor que o semanal.' });
    }
  });

export type SessionTimeLimitDTO = z.infer<typeof SessionTimeLimitSchema>;
