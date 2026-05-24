import { Options, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { WalletSchema } from './database/wallet.schema';

const config: Options = {
  driver: PostgreSqlDriver,
  clientUrl: process.env.DATABASE_URL || 'postgresql://admin:admin@localhost:5432/wallets',
  entities: [WalletSchema],
  debug: process.env.NODE_ENV !== 'production',
};

export default config;
