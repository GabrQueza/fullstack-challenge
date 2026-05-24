import { Module } from "@nestjs/common";
import { MikroOrmModule } from '@mikro-orm/nestjs';
import mikroOrmConfig from './infrastructure/mikro-orm.config';
import { WalletsController } from "./presentation/controllers/wallets.controller";
import { WalletEventsController } from "./presentation/messaging/wallet-events.controller";
import { WalletService } from "./application/wallet.service";
import { WalletRepository } from "./infrastructure/database/wallet.repository";
import { WALLET_REPOSITORY } from "./domain/wallet.repository.interface";

@Module({
  imports: [
    MikroOrmModule.forRoot(mikroOrmConfig),
  ],
  controllers: [WalletsController, WalletEventsController],
  providers: [
    WalletService,
    {
      provide: WALLET_REPOSITORY,
      useClass: WalletRepository,
    }
  ],
})
export class AppModule {}
