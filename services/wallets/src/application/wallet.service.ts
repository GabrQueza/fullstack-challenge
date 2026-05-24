import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IWalletRepository, WALLET_REPOSITORY } from '../domain/wallet.repository.interface';
import { Wallet } from '../domain/wallet.entity';
import { InsufficientBalanceException } from '../domain/exceptions/insufficient-balance.exception';

@Injectable()
export class WalletService {
  constructor(
    @Inject(WALLET_REPOSITORY)
    private readonly walletRepository: IWalletRepository,
  ) {}

  async createWallet(userId: string): Promise<Wallet> {
    const existing = await this.walletRepository.findByUserId(userId);
    if (existing) {
      throw new Error('Wallet already exists for user');
    }
    const wallet = Wallet.create(userId);
    await this.walletRepository.save(wallet);
    return wallet;
  }

  async getWallet(userId: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }
    return wallet;
  }

  async processBetPlaced(userId: string, amount: bigint): Promise<void> {
    const wallet = await this.walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    // This will throw InsufficientBalanceException if balance is less than amount
    wallet.debit(amount);
    
    // Repository implementation handles the transaction and save
    await this.walletRepository.save(wallet);
  }

  async processBetWon(userId: string, amount: bigint): Promise<void> {
    const wallet = await this.walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    wallet.credit(amount);
    await this.walletRepository.save(wallet);
  }
}
