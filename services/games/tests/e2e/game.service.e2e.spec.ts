import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { GameService } from '../../src/application/game.service';
import { GameEngineService } from '../../src/application/game-engine.service';
import { RabbitMQPublisherService } from '../../src/infrastructure/rabbitmq/rabbitmq-publisher.service';
import { GameGateway } from '../../src/presentation/gateways/game.gateway';
import { Round, RoundState } from '../../src/domain/round.entity';
import { Bet } from '../../src/domain/bet.entity';
import { BadRequestException } from '@nestjs/common';

// Mock EntityManager
const createMockEm = () => ({
  persist: mock(() => ({ flush: mock(() => Promise.resolve()) })),
  flush: mock(() => Promise.resolve()),
  find: mock((): Promise<any[]> => Promise.resolve([])),
  findOne: mock((): Promise<any> => Promise.resolve(null)),
});

// Mock GameEngine
const createMockEngine = (round: Round | null, multiplier = 1.5) => ({
  getCurrentRound: mock(() => round),
  getCurrentMultiplier: mock(() => multiplier),
  onModuleInit: mock(() => {}),
});

// Mock RabbitMQ publisher
const createMockRabbit = () => ({
  publishBetPlaced: mock(() => {}),
  publishBetWon: mock(() => {}),
});

// Mock Gateway
const createMockGateway = () => ({
  emitBetPlaced: mock(() => {}),
  emitBetWon: mock(() => {}),
  emitGameState: mock(() => {}),
  emitTick: mock(() => {}),
  emitCrash: mock(() => {}),
  server: { emit: mock(() => {}) },
  setStateProvider: mock(() => {}),
});

describe('GameService (Integration)', () => {
  let gameService: GameService;
  let mockEm: ReturnType<typeof createMockEm>;
  let mockEngine: ReturnType<typeof createMockEngine>;
  let mockRabbit: ReturnType<typeof createMockRabbit>;
  let mockGateway: ReturnType<typeof createMockGateway>;
  let bettingRound: Round;

  beforeEach(() => {
    bettingRound = new Round('round-1', 'seed', 'hash', 3.5);
    mockEm = createMockEm();
    mockEngine = createMockEngine(bettingRound);
    mockRabbit = createMockRabbit();
    mockGateway = createMockGateway();

    gameService = new GameService(
      mockEngine as unknown as GameEngineService,
      mockRabbit as unknown as RabbitMQPublisherService,
      mockEm as any,
      mockGateway as unknown as GameGateway,
    );
  });

  describe('placeBet() - Happy Path', () => {
    it('should place a bet successfully during BETTING phase', async () => {
      const result = await gameService.placeBet('user-1', 1000);

      expect(result.success).toBe(true);
      expect(result.betId).toBeDefined();
      expect(mockEm.persist).toHaveBeenCalled();
      expect(mockRabbit.publishBetPlaced).toHaveBeenCalledWith({ userId: 'user-1', amount: 1000 });
      expect(mockGateway.emitBetPlaced).toHaveBeenCalledWith({ userId: 'user-1', amount: 1000 });
    });
  });

  describe('placeBet() - Error Scenarios', () => {
    it('should throw BadRequestException if no round is active', async () => {
      mockEngine.getCurrentRound = mock(() => null as any);

      try {
        await gameService.placeBet('user-1', 1000);
        expect(true).toBe(false); // Should not reach
      } catch (e: any) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toContain('not accepting bets');
      }
    });

    it('should throw BadRequestException if round is IN_PROGRESS', async () => {
      bettingRound.startMultiplier(); // Now IN_PROGRESS

      try {
        await gameService.placeBet('user-1', 1000);
        expect(true).toBe(false);
      } catch (e: any) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toContain('not accepting bets');
      }
    });

    it('should throw BadRequestException if round is CRASHED', async () => {
      bettingRound.startMultiplier();
      bettingRound.crash();

      try {
        await gameService.placeBet('user-1', 1000);
        expect(true).toBe(false);
      } catch (e: any) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });
  });

  describe('cashOut() - Happy Path', () => {
    it('should cash out successfully and emit events', async () => {
      bettingRound.startMultiplier(); // Round in progress
      mockEngine.getCurrentMultiplier = mock(() => 2.0);

      const existingBet = new Bet('bet-1', 'round-1', 'user-1', 1000);
      mockEm.findOne = mock(() => Promise.resolve(existingBet));
      mockEm.flush = mock(() => Promise.resolve());

      const result = await gameService.cashOut('user-1');

      expect(result.success).toBe(true);
      expect(result.multiplier).toBe(2.0);
      expect(result.amountWon).toBe(2000); // 1000 * 2.0
      expect(existingBet.cashOutMultiplier).toBe(2.0);
      expect(mockRabbit.publishBetWon).toHaveBeenCalled();
      expect(mockGateway.emitBetWon).toHaveBeenCalled();
    });
  });

  describe('cashOut() - Error Scenarios', () => {
    it('should throw if round is not in progress', async () => {
      // Round is still in BETTING
      try {
        await gameService.cashOut('user-1');
        expect(true).toBe(false);
      } catch (e: any) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toContain('Cannot cash out');
      }
    });

    it('should throw if bet not found', async () => {
      bettingRound.startMultiplier();
      mockEngine.getCurrentMultiplier = mock(() => 1.5);
      mockEm.findOne = mock(() => Promise.resolve(null));

      try {
        await gameService.cashOut('user-1');
        expect(true).toBe(false);
      } catch (e: any) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toContain('Bet not found');
      }
    });

    it('should throw if already cashed out', async () => {
      bettingRound.startMultiplier();
      mockEngine.getCurrentMultiplier = mock(() => 2.0);

      const alreadyCashedBet = new Bet('bet-1', 'round-1', 'user-1', 1000);
      alreadyCashedBet.cashOutMultiplier = 1.8;
      mockEm.findOne = mock(() => Promise.resolve(alreadyCashedBet));

      try {
        await gameService.cashOut('user-1');
        expect(true).toBe(false);
      } catch (e: any) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toContain('Already cashed out');
      }
    });
  });

  describe('getHistory()', () => {
    it('should query for crashed rounds ordered by date', async () => {
      const mockRounds = [
        { id: 'r1', status: 'CRASHED', crashPoint: 2.5 },
        { id: 'r2', status: 'CRASHED', crashPoint: 1.1 },
      ];
      mockEm.find = mock(() => Promise.resolve(mockRounds));

      const result = await gameService.getHistory();

      expect(result).toEqual(mockRounds);
      expect(mockEm.find).toHaveBeenCalledWith(
        'Round',
        { status: 'CRASHED' },
        { orderBy: { createdAt: 'DESC' }, limit: 20 }
      );
    });
  });

  describe('getMyBets()', () => {
    it('should query for user bets ordered by date', async () => {
      const mockBets = [
        { id: 'b1', userId: 'user-1', amount: 1000 },
      ];
      mockEm.find = mock(() => Promise.resolve(mockBets));

      const result = await gameService.getMyBets('user-1');

      expect(result).toEqual(mockBets);
      expect(mockEm.find).toHaveBeenCalledWith(
        'Bet',
        { userId: 'user-1' },
        { orderBy: { createdAt: 'DESC' }, limit: 20, offset: 0 }
      );
    });
  });
});
