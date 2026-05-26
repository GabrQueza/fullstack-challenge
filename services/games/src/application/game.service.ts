import { Injectable, BadRequestException } from '@nestjs/common';
import { GameEngineService } from './game-engine.service';
import { RabbitMQPublisherService } from '../infrastructure/rabbitmq/rabbitmq-publisher.service';
import { EntityManager } from '@mikro-orm/postgresql';
import { Bet } from '../domain/bet.entity';
import { Round } from '../domain/round.entity';
import { GameGateway } from '../presentation/gateways/game.gateway';

@Injectable()
export class GameService {
  constructor(
    private readonly gameEngine: GameEngineService,
    private readonly rabbitPublisher: RabbitMQPublisherService,
    private readonly em: EntityManager,
    private readonly gateway: GameGateway,
  ) {}

  async placeBet(userId: string, amount: number) {
    const round = this.gameEngine.getCurrentRound();
    if (!round || !round.isAcceptingBets()) {
      throw new BadRequestException('Round is not accepting bets');
    }

    const bet = Bet.create(round.id, userId, amount);
    await this.em.persist(bet).flush();

    this.rabbitPublisher.publishBetPlaced({ userId, amount });
    this.gateway.emitBetPlaced({ userId, amount }); // Also emit to websocket directly

    return { success: true, betId: bet.id };
  }

  async cashOut(userId: string) {
    const round = this.gameEngine.getCurrentRound();
    const currentMultiplier = this.gameEngine.getCurrentMultiplier();

    if (!round || !round.canCashOut(currentMultiplier)) {
      throw new BadRequestException('Cannot cash out right now');
    }

    const bet = await this.em.findOne(Bet, { roundId: round.id, userId });
    if (!bet) {
      throw new BadRequestException('Bet not found');
    }

    if (bet.cashOutMultiplier) {
      throw new BadRequestException('Already cashed out');
    }

    bet.cashOut(currentMultiplier);
    await this.em.flush();

    const amountWon = Math.floor(Number(bet.amount) * currentMultiplier);

    this.rabbitPublisher.publishBetWon({
      userId,
      gameId: round.id,
      multiplier: currentMultiplier,
      amount: amountWon,
    });

    this.gateway.emitBetWon({
      userId,
      multiplier: currentMultiplier,
      amount: amountWon,
    });

    return { success: true, multiplier: currentMultiplier, amountWon };
  }

  async getHistory() {
    return this.em.find(
      'Round',
      { status: 'CRASHED' },
      { orderBy: { createdAt: 'DESC' }, limit: 20 }
    );
  }

  async getMyBets(userId: string, limit = 20, offset = 0) {
    return this.em.find(
      'Bet',
      { userId },
      { orderBy: { createdAt: 'DESC' }, limit, offset }
    );
  }
}
