import { z } from 'zod';

export const DepositLimitSchema = z
  .object({
    dailyAmount: z.number().positive().nullable().optional(),
    weeklyAmount: z.number().positive().nullable().optional(),
    monthlyAmount: z.number().positive().nullable().optional(),
    reason: z.string().max(500).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    const { dailyAmount: d, weeklyAmount: w, monthlyAmount: m } = data;
    if (d && w && w < d) {
      ctx.addIssue({ code: 'custom', path: ['weeklyAmount'], message: 'Limite semanal não pode ser menor que o diário.' });
    }
    if (w && m && m < w) {
      ctx.addIssue({ code: 'custom', path: ['monthlyAmount'], message: 'Limite mensal não pode ser menor que o semanal.' });
    }
  });

export type DepositLimitDTO = z.infer<typeof DepositLimitSchema>;
