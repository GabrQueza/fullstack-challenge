import { describe, it, expect } from 'bun:test';
import { Wallet } from '../../src/domain/wallet.entity';
import { InsufficientBalanceException } from '../../src/domain/exceptions/insufficient-balance.exception';

describe('Wallet Entity', () => {
  describe('creation', () => {
    it('should create a wallet with zero balance', () => {
      const wallet = Wallet.create('user-1');
      expect(wallet.userId).toBe('user-1');
      expect(wallet.balance).toBe(0n);
    });

    it('should generate a unique id', () => {
      const wallet = Wallet.create('user-1');
      expect(wallet.id).toBeDefined();
      expect(wallet.id.length).toBeGreaterThan(0);
    });

    it('should accept an initial balance via constructor', () => {
      const wallet = new Wallet('w-1', 'user-1', 100000n);
      expect(wallet.balance).toBe(100000n);
    });
  });

  describe('credit()', () => {
    it('should increase the balance', () => {
      const wallet = new Wallet('w-1', 'user-1', 1000n);
      wallet.credit(500n);
      expect(wallet.balance).toBe(1500n);
    });

    it('should handle large BigInt values', () => {
      const wallet = new Wallet('w-1', 'user-1', 0n);
      wallet.credit(99999999999n);
      expect(wallet.balance).toBe(99999999999n);
    });

    it('should throw if credit amount is zero', () => {
      const wallet = Wallet.create('user-1');
      expect(() => wallet.credit(0n)).toThrow('Credit amount must be positive');
    });

    it('should throw if credit amount is negative', () => {
      const wallet = Wallet.create('user-1');
      expect(() => wallet.credit(-100n)).toThrow('Credit amount must be positive');
    });
  });

  describe('debit()', () => {
    it('should decrease the balance', () => {
      const wallet = new Wallet('w-1', 'user-1', 1000n);
      wallet.debit(300n);
      expect(wallet.balance).toBe(700n);
    });

    it('should allow debiting the exact balance (zero remaining)', () => {
      const wallet = new Wallet('w-1', 'user-1', 500n);
      wallet.debit(500n);
      expect(wallet.balance).toBe(0n);
    });

    it('should throw InsufficientBalanceException when debiting more than balance', () => {
      const wallet = new Wallet('w-1', 'user-1', 100n);
      expect(() => wallet.debit(200n)).toThrow(InsufficientBalanceException);
    });

    it('should throw if debit amount is zero', () => {
      const wallet = new Wallet('w-1', 'user-1', 1000n);
      expect(() => wallet.debit(0n)).toThrow('Debit amount must be positive');
    });

    it('should throw if debit amount is negative', () => {
      const wallet = new Wallet('w-1', 'user-1', 1000n);
      expect(() => wallet.debit(-100n)).toThrow('Debit amount must be positive');
    });

    it('should never allow negative balance', () => {
      const wallet = new Wallet('w-1', 'user-1', 50n);
      expect(() => wallet.debit(51n)).toThrow(InsufficientBalanceException);
      expect(wallet.balance).toBe(50n); // Balance unchanged after failed debit
    });
  });

  describe('credit + debit sequences', () => {
    it('should maintain correct balance through multiple operations', () => {
      const wallet = Wallet.create('user-1');
      wallet.credit(10000n);  // R$100
      wallet.debit(2500n);    // -R$25
      wallet.credit(500n);    // +R$5
      wallet.debit(8000n);    // -R$80
      expect(wallet.balance).toBe(0n);
    });

    it('should handle bet-then-win flow correctly (BigInt precision)', () => {
      const wallet = new Wallet('w-1', 'user-1', 100000n); // R$1000
      
      // Player bets R$10 (1000 cents)
      wallet.debit(1000n);
      expect(wallet.balance).toBe(99000n);
      
      // Player wins at 2.5x -> R$25 (2500 cents)
      wallet.credit(2500n);
      expect(wallet.balance).toBe(101500n);
    });
  });
});
