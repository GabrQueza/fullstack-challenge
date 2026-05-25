import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import type { PlaceBetPayload, CashOutPayload } from '@crash/types';

@Injectable()
export class RabbitMQPublisherService {
  constructor(@Inject('WALLET_SERVICE') private client: ClientProxy) {}

  publishBetPlaced(payload: PlaceBetPayload) {
    this.client.emit('bet.placed', payload);
  }

  publishBetWon(payload: CashOutPayload) {
    this.client.emit('bet.won', payload);
  }
}
