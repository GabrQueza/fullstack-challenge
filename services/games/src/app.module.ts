import { Module } from "@nestjs/common";
import { MikroOrmModule } from '@mikro-orm/nestjs';
import mikroOrmConfig from './infrastructure/mikro-orm.config';
import { GameController } from './presentation/controllers/game.controller';
import { GameGateway } from './presentation/gateways/game.gateway';
import { GameService } from './application/game.service';
import { GameEngineService } from './application/game-engine.service';
import { ProvablyFairService } from './domain/provably-fair.service';
import { RabbitMQPublisherService } from './infrastructure/rabbitmq/rabbitmq-publisher.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    MikroOrmModule.forRoot(mikroOrmConfig),
    ClientsModule.register([
      {
        name: 'WALLET_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672'],
          queue: 'wallets_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [GameController],
  providers: [
    GameGateway,
    GameService,
    GameEngineService,
    ProvablyFairService,
    RabbitMQPublisherService,
  ],
})
export class AppModule {}
