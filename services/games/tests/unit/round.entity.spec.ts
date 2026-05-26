import { describe, it, expect } from 'bun:test';
import { Round, RoundState } from '../../src/domain/round.entity';

describe('Round Entity', () => {
  const makeRound = () => {
    return new Round(
      'round-1',
      'server-seed-abc123',
      'hash-abc123',
      2.5,
    );
  };

  describe('creation', () => {
    it('should create a round with BETTING status', () => {
      const round = makeRound();
      expect(round.status).toBe(RoundState.BETTING);
    });

    it('should store the server seed and hash', () => {
      const round = makeRound();
      expect(round.serverSeed).toBe('server-seed-abc123');
      expect(round.serverSeedHash).toBe('hash-abc123');
    });

    it('should store the crash point', () => {
      const round = makeRound();
      expect(round.crashPoint).toBe(2.5);
    });

    it('should set createdAt and updatedAt dates', () => {
      const round = makeRound();
      expect(round.createdAt).toBeInstanceOf(Date);
      expect(round.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('static create()', () => {
    it('should create a round with a valid UUID', () => {
      const round = Round.create();
      expect(round.id).toBeDefined();
      expect(round.id.length).toBeGreaterThan(0);
    });

    it('should generate a server seed', () => {
      const round = Round.create();
      expect(round.serverSeed).toBeDefined();
      expect(round.serverSeed.length).toBe(64); // 32 bytes hex
    });

    it('should compute a hash of the server seed', () => {
      const round = Round.create();
      expect(round.serverSeedHash).toBeDefined();
      expect(round.serverSeedHash.length).toBe(64); // SHA-256 hex
    });

    it('should calculate a crash point >= 1.0', () => {
      const round = Round.create();
      expect(round.crashPoint).toBeGreaterThanOrEqual(1.0);
    });
  });

  describe('state transitions', () => {
    it('should transition from BETTING to IN_PROGRESS', () => {
      const round = makeRound();
      round.startMultiplier();
      expect(round.status).toBe(RoundState.IN_PROGRESS);
    });

    it('should transition from IN_PROGRESS to CRASHED', () => {
      const round = makeRound();
      round.startMultiplier();
      round.crash();
      expect(round.status).toBe(RoundState.CRASHED);
    });

    it('should throw if starting multiplier from non-BETTING state', () => {
      const round = makeRound();
      round.startMultiplier(); // now IN_PROGRESS
      expect(() => round.startMultiplier()).toThrow('Can only start multiplier from BETTING state');
    });

    it('should throw if crashing from BETTING state', () => {
      const round = makeRound();
      expect(() => round.crash()).toThrow('Can only crash from IN_PROGRESS state');
    });

    it('should throw if crashing from already CRASHED state', () => {
      const round = makeRound();
      round.startMultiplier();
      round.crash();
      expect(() => round.crash()).toThrow('Can only crash from IN_PROGRESS state');
    });
  });

  describe('isAcceptingBets()', () => {
    it('should return true when status is BETTING', () => {
      const round = makeRound();
      expect(round.isAcceptingBets()).toBe(true);
    });

    it('should return false when status is IN_PROGRESS', () => {
      const round = makeRound();
      round.startMultiplier();
      expect(round.isAcceptingBets()).toBe(false);
    });

    it('should return false when status is CRASHED', () => {
      const round = makeRound();
      round.startMultiplier();
      round.crash();
      expect(round.isAcceptingBets()).toBe(false);
    });
  });

  describe('canCashOut()', () => {
    it('should return true when IN_PROGRESS and multiplier <= crashPoint', () => {
      const round = makeRound(); // crashPoint = 2.5
      round.startMultiplier();
      expect(round.canCashOut(1.5)).toBe(true);
      expect(round.canCashOut(2.5)).toBe(true);
    });

    it('should return false when multiplier > crashPoint', () => {
      const round = makeRound();
      round.startMultiplier();
      expect(round.canCashOut(3.0)).toBe(false);
    });

    it('should return false when not IN_PROGRESS', () => {
      const round = makeRound();
      expect(round.canCashOut(1.5)).toBe(false);
    });
  });
});
