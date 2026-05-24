import { describe, it, expect } from 'bun:test';
import { ProvablyFairService } from '../../src/domain/provably-fair.service';
import * as crypto from 'crypto';

describe('ProvablyFairService', () => {
  it('should generate a 256-bit (64 hex char) server seed', () => {
    const seed = ProvablyFairService.generateServerSeed();
    expect(seed.length).toBe(64);
  });

  it('should correctly hash the server seed using SHA-256', () => {
    const seed = 'test_seed_123';
    const hash = ProvablyFairService.hashServerSeed(seed);
    const expected = crypto.createHash('sha256').update(seed).digest('hex');
    expect(hash).toBe(expected);
  });

  it('should be deterministic and calculate identical crash points for same seed', () => {
    const seed = 'a_very_secure_server_seed_that_will_crash_at_some_point';
    
    const crash1 = ProvablyFairService.calculateCrashPoint(seed);
    const crash2 = ProvablyFairService.calculateCrashPoint(seed);
    
    expect(crash1).toBe(crash2);
    expect(crash1).toBeGreaterThanOrEqual(1.0);
  });
});
