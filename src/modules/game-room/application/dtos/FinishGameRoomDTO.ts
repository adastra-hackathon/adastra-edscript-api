import { z } from 'zod';

export const FinishGameRoomSchema = z.object({
  results: z.array(
    z.object({
      userId: z.string().min(1),
      finalBalance: z.number().nonnegative(),
      position: z.number().int().positive(),
    }),
  ).min(1),
  winnerId: z.string().min(1),
  lastPlaceUserId: z.string().min(1),
});

export type FinishGameRoomDTO = z.infer<typeof FinishGameRoomSchema>;
