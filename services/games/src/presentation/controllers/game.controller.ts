import { Controller, Post, Get, Body, Req, Param, BadRequestException, UseGuards } from '@nestjs/common';
import { GameService } from '../../application/game.service';
import { EntityManager } from '@mikro-orm/postgresql';
import { Round } from '../../domain/round.entity';
import { ProvablyFairService } from '../../domain/provably-fair.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

export class PlaceBetDto {
  amount: number;
}

@Controller('games')
export class GameController {
  constructor(
    private readonly gameService: GameService,
    private readonly em: EntityManager,
  ) {}

  @Post('bet')
  @UseGuards(JwtAuthGuard)
  async placeBet(@Req() req: any, @Body() body: PlaceBetDto) {
    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('User ID not found in token');
    if (!body.amount || body.amount <= 0) throw new BadRequestException('Valid amount is required');

    return this.gameService.placeBet(userId, body.amount);
  }

  @Post('bet/cashout')
  @UseGuards(JwtAuthGuard)
  async cashOut(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('User ID not found in token');

    return this.gameService.cashOut(userId);
  }

  @Get('rounds/:roundId/verify')
  async verifyRound(@Param('roundId') roundId: string) {
    const round = await this.em.findOne(Round, roundId);
    if (!round) throw new BadRequestException('Round not found');

    if (round.status !== 'CRASHED') {
      throw new BadRequestException('Can only verify crashed rounds');
    }

    return {
      roundId: round.id,
      serverSeed: round.serverSeed,
      serverSeedHash: round.serverSeedHash,
      clientSeed: ProvablyFairService.CLIENT_SEED,
      crashPoint: round.crashPoint,
    };
  }

  @Get('health')
  check() {
    return { status: 'ok', service: 'games' };
  }
}
