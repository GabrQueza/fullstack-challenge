import { describe, it, expect } from 'bun:test';
import { Wallet } from '../../src/domain/wallet.entity';
import { InsufficientBalanceException } from '../../src/domain/exceptions/insufficient-balance.exception';

describe('Wallet Entity', () => {
  it('should create a wallet with zero balance by default', () => {
    const wallet = Wallet.create('user-1');
    expect(wallet.balance).toBe(0n);
  });

  it('should credit amount correctly', () => {
    const wallet = Wallet.create('user-1');
    wallet.credit(100n);
    expect(wallet.balance).toBe(100n);
  });

  it('should debit amount correctly', () => {
    const wallet = Wallet.create('user-1');
    wallet.credit(200n);
    wallet.debit(50n);
    expect(wallet.balance).toBe(150n);
  });

  it('should throw error when crediting negative or zero amount', () => {
    const wallet = Wallet.create('user-1');
    expect(() => wallet.credit(-10n)).toThrow('Credit amount must be positive');
    expect(() => wallet.credit(0n)).toThrow('Credit amount must be positive');
  });

  it('should throw error when debiting negative or zero amount', () => {
    const wallet = Wallet.create('user-1');
    expect(() => wallet.debit(-10n)).toThrow('Debit amount must be positive');
    expect(() => wallet.debit(0n)).toThrow('Debit amount must be positive');
  });

  it('should throw InsufficientBalanceException when debiting more than balance', () => {
    const wallet = Wallet.create('user-1');
    wallet.credit(50n);
    
    expect(() => wallet.debit(100n)).toThrow(InsufficientBalanceException);
    
    // Ensure balance was not modified
    expect(wallet.balance).toBe(50n);
  });

  it('should perform exact bigint math without floating point errors', () => {
    const wallet = Wallet.create('user-1');
    // Credit 10 billion cents
    wallet.credit(10_000_000_000n);
    expect(wallet.balance).toBe(10000000000n);
    
    // Debit 1 cent
    wallet.debit(1n);
    expect(wallet.balance).toBe(9999999999n);
  });
});
