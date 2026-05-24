import { EntitySchema } from '@mikro-orm/core';
import { Round } from '../../domain/round.entity';

export const RoundSchema = new EntitySchema<Round>({
  class: Round,
  properties: {
    id: { type: 'uuid', primary: true },
    status: { type: 'string' },
    serverSeed: { type: 'string' },
    serverSeedHash: { type: 'string' },
    crashPoint: { type: 'float' },
    createdAt: { type: 'datetime' },
    updatedAt: { type: 'datetime' },
  },
});
