import { z } from 'zod';

export const updateNotificationPrefsSchema = z.object({
  emailOnDeposit: z.boolean().optional(),
  emailOnWithdrawal: z.boolean().optional(),
  checkIntervalMinutes: z.number().int().min(1).nullable().optional(),
});

export type UpdateNotificationPrefsDTO = z.infer<typeof updateNotificationPrefsSchema>;
