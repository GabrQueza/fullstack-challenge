import { EntitySchema } from '@mikro-orm/core';
import { Bet } from '../../domain/bet.entity';

export const BetSchema = new EntitySchema<Bet>({
  class: Bet,
  properties: {
    id: { type: 'uuid', primary: true },
    roundId: { type: 'string' },
    userId: { type: 'string' },
    amount: { type: 'bigint' },
    cashOutMultiplier: { type: 'float', nullable: true },
    createdAt: { type: 'datetime' },
  },
});
