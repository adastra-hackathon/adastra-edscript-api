import { z } from 'zod';

export const SubmitPredictionsSchema = z.object({
  predictions: z
    .array(
      z.object({
        eventId: z.string().uuid(),
        optionId: z.string().uuid(),
      }),
    )
    .min(1),
});

export type SubmitPredictionsDTO = z.infer<typeof SubmitPredictionsSchema>;
