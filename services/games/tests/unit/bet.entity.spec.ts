import { describe, it, expect } from 'bun:test';
import { Bet } from '../../src/domain/bet.entity';

describe('Bet Entity', () => {
  describe('creation', () => {
    it('should create a bet with correct properties', () => {
      const bet = new Bet('bet-1', 'round-1', 'user-1', 1000);
      expect(bet.id).toBe('bet-1');
      expect(bet.roundId).toBe('round-1');
      expect(bet.userId).toBe('user-1');
      expect(bet.amount).toBe(1000);
      expect(bet.cashOutMultiplier).toBeUndefined();
    });

    it('should set createdAt on construction', () => {
      const bet = new Bet('bet-1', 'round-1', 'user-1', 500);
      expect(bet.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('static create()', () => {
    it('should create a bet with a UUID', () => {
      const bet = Bet.create('round-1', 'user-1', 1000);
      expect(bet.id).toBeDefined();
      expect(bet.id.length).toBeGreaterThan(0);
      expect(bet.roundId).toBe('round-1');
      expect(bet.userId).toBe('user-1');
      expect(bet.amount).toBe(1000);
    });
  });

  describe('cashOut()', () => {
    it('should set cashOutMultiplier on first call', () => {
      const bet = Bet.create('round-1', 'user-1', 1000);
      bet.cashOut(2.5);
      expect(bet.cashOutMultiplier).toBe(2.5);
    });

    it('should not overwrite cashOutMultiplier on subsequent calls', () => {
      const bet = Bet.create('round-1', 'user-1', 1000);
      bet.cashOut(2.5);
      bet.cashOut(5.0); // Should be ignored
      expect(bet.cashOutMultiplier).toBe(2.5);
    });

    it('should correctly compute winnings (amount * multiplier)', () => {
      const bet = Bet.create('round-1', 'user-1', 1000); // 1000 cents = R$10
      bet.cashOut(2.0);
      const winnings = Math.floor(bet.amount * (bet.cashOutMultiplier || 0));
      expect(winnings).toBe(2000); // R$20
    });

    it('should handle multiplier of 1.0 (break-even)', () => {
      const bet = Bet.create('round-1', 'user-1', 500);
      bet.cashOut(1.0);
      expect(bet.cashOutMultiplier).toBe(1.0);
      const winnings = Math.floor(bet.amount * (bet.cashOutMultiplier || 0));
      expect(winnings).toBe(500);
    });

    it('should handle high multiplier precisely', () => {
      const bet = Bet.create('round-1', 'user-1', 100); // R$1
      bet.cashOut(45.64);
      expect(bet.cashOutMultiplier).toBe(45.64);
      const winnings = Math.floor(bet.amount * (bet.cashOutMultiplier || 0));
      expect(winnings).toBe(4564); // R$45.64
    });
  });
});
