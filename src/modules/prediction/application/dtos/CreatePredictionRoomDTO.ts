import { z } from 'zod';

export const CreatePredictionRoomSchema = z.object({
  title: z.string().min(3).max(100),
  entryAmount: z.number().positive(),
  maxPlayers: z.number().int().min(2).max(20).default(10),
  predictionsDeadline: z.string().datetime().optional(),
  isSimulation: z.boolean().default(false),
  events: z
    .array(
      z.object({
        title: z.string().min(1).max(200),
        description: z.string().max(500).optional(),
        sortOrder: z.number().int().default(0),
        options: z
          .array(
            z.object({
              label: z.string().min(1).max(100),
              sortOrder: z.number().int().default(0),
            }),
          )
          .min(2, 'Each event must have at least 2 options'),
      }),
    )
    .min(1, 'At least one event is required'),
});

export type CreatePredictionRoomDTO = z.infer<typeof CreatePredictionRoomSchema>;
