import { z } from 'zod';

export const FinishPredictionRoomSchema = z.object({
  correctOptions: z
    .array(
      z.object({
        eventId: z.string().uuid(),
        optionId: z.string().uuid(),
      }),
    )
    .min(1),
});

export type FinishPredictionRoomDTO = z.infer<typeof FinishPredictionRoomSchema>;
