import * as crypto from 'crypto';

export class Bet {
  public id: string;
  public roundId: string;
  public userId: string;
  public amount: number;
  public cashOutMultiplier?: number;
  public createdAt: Date;

  constructor(id: string, roundId: string, userId: string, amount: number) {
    this.id = id;
    this.roundId = roundId;
    this.userId = userId;
    this.amount = amount;
    this.createdAt = new Date();
  }

  static create(roundId: string, userId: string, amount: number): Bet {
    return new Bet(crypto.randomUUID(), roundId, userId, amount);
  }

  cashOut(multiplier: number): void {
    if (this.cashOutMultiplier) {
      return; // Handled in service
    }
    this.cashOutMultiplier = multiplier;
  }
}
