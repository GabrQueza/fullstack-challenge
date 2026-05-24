import { EntitySchema } from '@mikro-orm/core';
import { Wallet } from '../../domain/wallet.entity';

export const WalletSchema = new EntitySchema<Wallet>({
  class: Wallet,
  properties: {
    id: { type: 'uuid', primary: true },
    userId: { type: 'string', unique: true },
    _balance: { type: 'bigint', fieldName: 'balance', default: '0' },
    createdAt: { type: 'datetime', onCreate: () => new Date() },
    updatedAt: { type: 'datetime', onCreate: () => new Date(), onUpdate: () => new Date() },
  },
});
