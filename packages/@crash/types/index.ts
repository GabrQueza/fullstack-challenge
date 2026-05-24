export interface Game {
  id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'CRASHED' | 'FINISHED';
  multiplier: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
}

export interface PlaceBetPayload {
  userId: string;
  amount: number;
  targetMultiplier?: number;
}

export interface CashOutPayload {
  userId: string;
  gameId: string;
  multiplier: number;
  amount: number;
}
