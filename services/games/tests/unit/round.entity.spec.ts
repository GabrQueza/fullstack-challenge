import { describe, it, expect } from 'bun:test';
import { Round, RoundState } from '../../src/domain/round.entity';

describe('Round Entity', () => {
  it('should initialize in BETTING state', () => {
    const round = Round.create();
    expect(round.status).toBe(RoundState.BETTING);
    expect(round.isAcceptingBets()).toBe(true);
  });

  it('should transition to IN_PROGRESS when starting multiplier', () => {
    const round = Round.create();
    round.startMultiplier();
    expect(round.status).toBe(RoundState.IN_PROGRESS);
    expect(round.isAcceptingBets()).toBe(false);
  });

  it('should throw if starting multiplier from non-BETTING state', () => {
    const round = Round.create();
    round.startMultiplier();
    expect(() => round.startMultiplier()).toThrow();
  });

  it('should transition to CRASHED from IN_PROGRESS', () => {
    const round = Round.create();
    round.startMultiplier();
    round.crash();
    expect(round.status).toBe(RoundState.CRASHED);
    expect(round.canCashOut(2.0)).toBe(false);
  });

  it('should allow cash out only IN_PROGRESS and before or equal to crash point', () => {
    const round = Round.create();
    round.crashPoint = 3.5; // override for deterministic testing
    
    expect(round.canCashOut(2.0)).toBe(false); // Because it is still BETTING

    round.startMultiplier();
    expect(round.canCashOut(2.0)).toBe(true);
    expect(round.canCashOut(3.5)).toBe(true);
    expect(round.canCashOut(3.51)).toBe(false);
    
    round.crash();
    expect(round.canCashOut(2.0)).toBe(false); // Already crashed
  });
});
