import { Options, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { RoundSchema } from './database/round.schema';
import { BetSchema } from './database/bet.schema';

const config: Options = {
  driver: PostgreSqlDriver,
  clientUrl: process.env.DATABASE_URL || 'postgresql://admin:admin@localhost:5432/games',
  entities: [RoundSchema, BetSchema],
  debug: process.env.NODE_ENV !== 'production',
};

export default config;
