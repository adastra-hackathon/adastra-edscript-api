import { z } from 'zod';

export const CreateSelectionSchema = z.object({
  eventId: z.string().min(1),
  eventName: z.string().min(1).max(200),
  marketName: z.string().min(1).max(100),
  selectionName: z.string().min(1).max(100),
  odd: z.number().positive().min(1),
  stake: z.number().positive().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
});

export const CreateBetslipSchema = z.object({
  type: z.enum(['SIMPLE', 'MULTIPLE', 'SYSTEM']).default('MULTIPLE'),
  selections: z.array(CreateSelectionSchema).min(1, 'Adicione pelo menos uma seleção.'),
  totalStake: z.number().nonnegative(),
  totalOdds: z.number().nonnegative(),
  potentialPayout: z.number().nonnegative(),
  acceptAnyOddsChange: z.boolean().optional().default(false),
  acceptOnlyHigherOdds: z.boolean().optional().default(false),
});

export type CreateBetslipDTO = z.infer<typeof CreateBetslipSchema>;
