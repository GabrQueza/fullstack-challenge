import * as crypto from 'crypto';
import { InsufficientBalanceException } from './exceptions/insufficient-balance.exception';

export class Wallet {
  public readonly id: string;
  public readonly userId: string;
  private _balance: bigint;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(
    id: string,
    userId: string,
    balance: bigint = 0n,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
  ) {
    this.id = id;
    this.userId = userId;
    this._balance = balance;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(userId: string): Wallet {
    return new Wallet(crypto.randomUUID(), userId, 0n);
  }

  get balance(): bigint {
    return this._balance;
  }

  credit(amount: bigint): void {
    if (amount <= 0n) {
      throw new Error('Credit amount must be positive');
    }
    this._balance += amount;
  }

  debit(amount: bigint): void {
    if (amount <= 0n) {
      throw new Error('Debit amount must be positive');
    }
    if (this._balance < amount) {
      throw new InsufficientBalanceException();
    }
    this._balance -= amount;
  }
}
