import * as crypto from 'crypto';
import { ProvablyFairService } from './provably-fair.service';

export enum RoundState {
  BETTING = 'BETTING',
  IN_PROGRESS = 'IN_PROGRESS',
  CRASHED = 'CRASHED',
}

export class Round {
  public id: string;
  public status: RoundState;
  public serverSeed: string;
  public serverSeedHash: string;
  public crashPoint: number;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(id: string, serverSeed: string, serverSeedHash: string, crashPoint: number) {
    this.id = id;
    this.status = RoundState.BETTING;
    this.serverSeed = serverSeed;
    this.serverSeedHash = serverSeedHash;
    this.crashPoint = crashPoint;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static create(): Round {
    const serverSeed = ProvablyFairService.generateServerSeed();
    const serverSeedHash = ProvablyFairService.hashServerSeed(serverSeed);
    const crashPoint = ProvablyFairService.calculateCrashPoint(serverSeed);
    return new Round(crypto.randomUUID(), serverSeed, serverSeedHash, crashPoint);
  }

  startMultiplier(): void {
    if (this.status !== RoundState.BETTING) {
      throw new Error('Can only start multiplier from BETTING state');
    }
    this.status = RoundState.IN_PROGRESS;
  }

  crash(): void {
    if (this.status !== RoundState.IN_PROGRESS) {
      throw new Error('Can only crash from IN_PROGRESS state');
    }
    this.status = RoundState.CRASHED;
  }

  isAcceptingBets(): boolean {
    return this.status === RoundState.BETTING;
  }

  canCashOut(multiplier: number): boolean {
    return this.status === RoundState.IN_PROGRESS && multiplier <= this.crashPoint;
  }
}
