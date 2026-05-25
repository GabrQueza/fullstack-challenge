import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import type { IWalletRepository } from '../../domain/wallet.repository.interface';
import { Wallet } from '../../domain/wallet.entity';

@Injectable()
export class WalletRepository implements IWalletRepository {
  constructor(private readonly em: EntityManager) {}

  async findById(id: string): Promise<Wallet | null> {
    return this.em.findOne(Wallet, { id });
  }

  async findByUserId(userId: string): Promise<Wallet | null> {
    return this.em.findOne(Wallet, { userId });
  }

  async save(wallet: Wallet): Promise<void> {
    // In MikroORM, calling flush will commit the unit of work to the database.
    await this.em.persistAndFlush(wallet);
  }
}
