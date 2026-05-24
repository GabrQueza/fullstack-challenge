import { create } from 'zustand';

export type RoundState = 'BETTING' | 'IN_PROGRESS' | 'CRASHED';

export interface Bet {
  userId: string;
  amount: number;
  cashOutMultiplier?: number;
}

interface GameStore {
  roundId: string | null;
  status: RoundState;
  multiplier: number;
  timeRemaining: number | null;
  crashPoint: number | null;
  bets: Bet[];
  setGameState: (state: Partial<GameStore>) => void;
  setTick: (multiplier: number) => void;
  addBet: (bet: Bet) => void;
  updateBet: (userId: string, multiplier: number) => void;
  setCrash: (crashPoint: number) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  roundId: null,
  status: 'BETTING',
  multiplier: 1.0,
  timeRemaining: null,
  crashPoint: null,
  bets: [],
  setGameState: (state) => set((prev) => ({ ...prev, ...state })),
  setTick: (multiplier) => set({ multiplier }),
  setCrash: (crashPoint) => set({ status: 'CRASHED', crashPoint, multiplier: crashPoint }),
  addBet: (bet) => set((prev) => ({ bets: [...prev.bets, bet] })),
  updateBet: (userId, multiplier) => set((prev) => ({
    bets: prev.bets.map(b => b.userId === userId ? { ...b, cashOutMultiplier: multiplier } : b)
  }))
}));
