export interface SelectionData {
  id: string;
  betSlipId: string;
  eventId: string;
  eventName: string;
  marketName: string;
  selectionName: string;
  odd: number;
  stake: number | null;
  sortOrder: number;
  createdAt: Date;
}

export interface BetSlipData {
  id: string;
  userId: string;
  type: 'SIMPLE' | 'MULTIPLE' | 'SYSTEM';
  status: 'DRAFT' | 'SUBMITTED' | 'SETTLED' | 'CANCELLED';
  totalStake: number;
  totalOdds: number;
  potentialPayout: number;
  acceptAnyOddsChange: boolean;
  acceptOnlyHigherOdds: boolean;
  selections: SelectionData[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSelectionInput {
  eventId: string;
  eventName: string;
  marketName: string;
  selectionName: string;
  odd: number;
  stake?: number;
  sortOrder?: number;
}

export interface CreateBetSlipInput {
  userId: string;
  type: 'SIMPLE' | 'MULTIPLE' | 'SYSTEM';
  selections: CreateSelectionInput[];
  totalStake: number;
  totalOdds: number;
  potentialPayout: number;
  acceptAnyOddsChange?: boolean;
  acceptOnlyHigherOdds?: boolean;
}

export interface UpdateBetSlipInput {
  totalStake?: number;
  totalOdds?: number;
  potentialPayout?: number;
  acceptAnyOddsChange?: boolean;
  acceptOnlyHigherOdds?: boolean;
}

export interface IBetslipRepository {
  create(input: CreateBetSlipInput): Promise<BetSlipData>;
  findById(id: string, userId: string): Promise<BetSlipData | null>;
  findAllByUser(userId: string): Promise<BetSlipData[]>;
  update(id: string, userId: string, input: UpdateBetSlipInput): Promise<BetSlipData>;
  submit(id: string, userId: string): Promise<BetSlipData>;
  removeSelection(betSlipId: string, selectionId: string, userId: string): Promise<BetSlipData>;
  clear(id: string, userId: string): Promise<BetSlipData>;
}
