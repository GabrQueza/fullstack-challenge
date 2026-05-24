import { Wallet } from './wallet.entity';

export const WALLET_REPOSITORY = Symbol('WALLET_REPOSITORY');

export interface IWalletRepository {
  findById(id: string): Promise<Wallet | null>;
  findByUserId(userId: string): Promise<Wallet | null>;
  save(wallet: Wallet): Promise<void>;
}
