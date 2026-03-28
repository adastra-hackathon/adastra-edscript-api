import { z } from 'zod';

export const CreateGameRoomSchema = z.object({
  gameId: z.string().min(1),
  entryAmount: z.number().positive(),
  maxPlayers: z.number().int().min(2).max(10).default(10),
  startAt: z.string().datetime().optional(),
  duration: z.number().int().positive().default(300),
  isSimulation: z.boolean().default(false),
});

export type CreateGameRoomDTO = z.infer<typeof CreateGameRoomSchema>;
