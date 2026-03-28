export type PredictionRoomStatus = 'WAITING' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED';
export type PredictionPlayerStatus = 'WAITING' | 'PREDICTING' | 'READY';

export interface PredictionOptionData {
  id: string;
  eventId: string;
  label: string;
  sortOrder: number;
}

export interface PredictionEventData {
  id: string;
  roomId: string;
  title: string;
  description: string | null;
  sortOrder: number;
  correctOptionId: string | null;
  createdAt: Date;
  options: PredictionOptionData[];
}

export interface UserPredictionData {
  id: string;
  playerId: string;
  eventId: string;
  optionId: string;
  isCorrect: boolean | null;
  createdAt: Date;
}

export interface PredictionRoomPlayerData {
  id: string;
  roomId: string;
  userId: string;
  isBot: boolean;
  displayName: string | null;
  status: PredictionPlayerStatus;
  score: number;
  position: number | null;
  joinedAt: Date;
  predictions: UserPredictionData[];
}

export interface PredictionRoomData {
  id: string;
  hostId: string;
  title: string;
  entryAmount: number;
  maxPlayers: number;
  status: PredictionRoomStatus;
  predictionsDeadline: Date | null;
  prizePool: number;
  platformFee: number;
  winnerId: string | null;
  isSimulation: boolean;
  createdAt: Date;
  updatedAt: Date;
  players: PredictionRoomPlayerData[];
  events: PredictionEventData[];
}

export interface CreatePredictionRoomInput {
  hostId: string;
  title: string;
  entryAmount: number;
  maxPlayers: number;
  predictionsDeadline?: Date;
  isSimulation?: boolean;
  events: Array<{
    title: string;
    description?: string;
    sortOrder: number;
    options: Array<{ label: string; sortOrder: number }>;
  }>;
}

export interface SubmitPredictionsInput {
  playerId: string;
  predictions: Array<{ eventId: string; optionId: string }>;
}

export interface FinishPredictionRoomInput {
  roomId: string;
  correctOptions: Array<{ eventId: string; optionId: string }>;
  entryAmount: number;
  isSimulation: boolean;
}

export interface IPredictionRoomRepository {
  create(input: CreatePredictionRoomInput): Promise<PredictionRoomData>;
  findById(id: string): Promise<PredictionRoomData | null>;
  findAll(status?: PredictionRoomStatus): Promise<PredictionRoomData[]>;
  addPlayer(roomId: string, userId: string): Promise<PredictionRoomData>;
  start(id: string): Promise<PredictionRoomData>;
  submitPredictions(input: SubmitPredictionsInput): Promise<PredictionRoomPlayerData>;
  finish(input: FinishPredictionRoomInput): Promise<PredictionRoomData>;
  getWalletBalance(userId: string): Promise<number>;
  deductBalance(userId: string, amount: number): Promise<void>;
  creditBalance(userId: string, amount: number): Promise<void>;
}
