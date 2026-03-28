export type GameRoomStatus = 'WAITING' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED';

export interface GameRoomPlayerData {
  id: string;
  roomId: string;
  userId: string;
  isBot: boolean;
  displayName: string | null;
  initialBalance: number;
  finalBalance: number | null;
  profit: number | null;
  position: number | null;
  joinedAt: Date;
}

export interface GameRoomVoucherData {
  id: string;
  userId: string;
  roomId: string;
  amount: number;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

export interface GameRoomData {
  id: string;
  hostId: string;
  gameId: string;
  entryAmount: number;
  maxPlayers: number;
  status: GameRoomStatus;
  startAt: Date | null;
  duration: number;
  prizePool: number;
  platformFee: number;
  winnerId: string | null;
  isSimulation: boolean;
  createdAt: Date;
  updatedAt: Date;
  players: GameRoomPlayerData[];
}

export interface CreateGameRoomInput {
  hostId: string;
  gameId: string;
  entryAmount: number;
  maxPlayers: number;
  startAt?: Date;
  duration: number;
  isSimulation?: boolean;
}

export interface AddBotsInput {
  roomId: string;
  count: number;
  initialBalance: number;
}

export interface FinishPlayerResult {
  userId: string;
  finalBalance: number;
  position: number;
}

export interface FinishGameRoomInput {
  roomId: string;
  results: FinishPlayerResult[];
  winnerId: string;
  lastPlaceUserId: string;
  entryAmount: number;
  isSimulation: boolean;
}

export interface IGameRoomRepository {
  create(input: CreateGameRoomInput): Promise<GameRoomData>;
  findById(id: string): Promise<GameRoomData | null>;
  findAll(status?: GameRoomStatus): Promise<GameRoomData[]>;
  addPlayer(roomId: string, userId: string, initialBalance: number): Promise<GameRoomData>;
  addBots(input: AddBotsInput): Promise<GameRoomData>;
  start(id: string, startAt: Date): Promise<GameRoomData>;
  finish(input: FinishGameRoomInput): Promise<GameRoomData>;
  getWalletBalance(userId: string): Promise<number>;
  deductBalance(userId: string, amount: number): Promise<void>;
  creditBalance(userId: string, amount: number): Promise<void>;
  createVoucher(userId: string, roomId: string, amount: number, expiresAt: Date): Promise<GameRoomVoucherData>;
}
