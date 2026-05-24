import * as crypto from 'crypto';

export class ProvablyFairService {
  public static readonly CLIENT_SEED = '0000000000000000000301e2801a9a9598bfb114e574a91a887f2132f33047e6'; // Fixed client seed

  static generateServerSeed(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static hashServerSeed(serverSeed: string): string {
    return crypto.createHash('sha256').update(serverSeed).digest('hex');
  }

  static calculateCrashPoint(serverSeed: string): number {
    const hash = crypto
      .createHmac('sha256', serverSeed)
      .update(this.CLIENT_SEED)
      .digest('hex');

    // 1% instant crash edge
    if (this.isDivisible(hash, 100)) {
      return 1.0;
    }

    const h = parseInt(hash.slice(0, 13), 16);
    const e = Math.pow(2, 52);

    const result = Math.floor((100 * e - h) / (e - h)) / 100;
    return Math.max(1.0, result);
  }

  private static isDivisible(hash: string, mod: number): boolean {
    let val = 0;
    const o = hash.length % 4;
    for (let i = o > 0 ? o - 4 : 0; i < hash.length; i += 4) {
      val = ((val << 16) + parseInt(hash.substring(i, i + 4), 16)) % mod;
    }
    return val === 0;
  }
}
