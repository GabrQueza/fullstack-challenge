import { Injectable, OnModuleInit } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { GameGateway } from '../presentation/gateways/game.gateway';
import { Round, RoundState } from '../domain/round.entity';

@Injectable()
export class GameEngineService implements OnModuleInit {
  private currentRound: Round;
  private currentMultiplier = 1.0;
  private readonly TICK_RATE_MS = 100;
  private isRunning = false;

  constructor(
    private readonly gateway: GameGateway,
    private readonly em: EntityManager,
  ) {
    this.gateway.setStateProvider(() => {
      const round = this.getCurrentRound();
      if (!round) return null;
      return {
        status: round.status,
        roundId: round.id,
        serverSeedHash: round.serverSeedHash,
        multiplier: this.getCurrentMultiplier(),
      };
    });
  }

  onModuleInit() {
    setTimeout(() => this.startEngine(), 1000);
  }

  private async startEngine() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    while (true) {
      await this.runBettingPhase();
      await this.runInProgressPhase();
      await this.runCrashedPhase();
    }
  }

  private async runBettingPhase() {
    this.currentRound = Round.create();
    this.currentMultiplier = 1.0;

    const em = this.em.fork();
    await em.persist(this.currentRound).flush();

    // 10 seconds betting window
    const BETTING_TIME_MS = 10000;

    this.gateway.emitGameState({
      status: RoundState.BETTING,
      roundId: this.currentRound.id,
      serverSeedHash: this.currentRound.serverSeedHash,
      timeRemaining: BETTING_TIME_MS,
    });

    await this.sleep(BETTING_TIME_MS);
  }

  private async runInProgressPhase() {
    this.currentRound.startMultiplier();
    
    const em = this.em.fork();
    const roundToUpdate = await em.findOne(Round, this.currentRound.id);
    if (roundToUpdate) {
      roundToUpdate.status = RoundState.IN_PROGRESS;
      await em.flush();
    }

    this.gateway.emitGameState({
      status: RoundState.IN_PROGRESS,
      roundId: this.currentRound.id,
    });

    const startTime = Date.now();

    while (this.currentRound.status === RoundState.IN_PROGRESS) {
      const elapsedMs = Date.now() - startTime;
      
      this.currentMultiplier = Math.max(1.0, Math.pow(Math.E, 0.00006 * elapsedMs));

      if (this.currentMultiplier >= this.currentRound.crashPoint) {
        this.currentMultiplier = this.currentRound.crashPoint;
        this.currentRound.crash();
        break;
      }

      this.gateway.emitTick({
        multiplier: parseFloat(this.currentMultiplier.toFixed(2)),
      });

      await this.sleep(this.TICK_RATE_MS);
    }
  }

  private async runCrashedPhase() {
    const em = this.em.fork();
    const roundToUpdate = await em.findOne(Round, this.currentRound.id);
    if (roundToUpdate) {
      roundToUpdate.status = RoundState.CRASHED;
      await em.flush();
    }

    this.gateway.emitCrash({
      roundId: this.currentRound.id,
      crashPoint: parseFloat(this.currentRound.crashPoint.toFixed(2)),
      serverSeed: this.currentRound.serverSeed,
    });

    this.gateway.emitGameState({
      status: RoundState.CRASHED,
      roundId: this.currentRound.id,
    });

    await this.sleep(3000);
  }

  getCurrentRound(): Round {
    return this.currentRound;
  }

  getCurrentMultiplier(): number {
    return parseFloat(this.currentMultiplier.toFixed(2));
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
