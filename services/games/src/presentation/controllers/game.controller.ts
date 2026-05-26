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
    console.log('--- NEW BET REQUEST ---');
    console.log('User:', req.user);
    console.log('Body:', body);
    
    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('User ID not found in token');
    if (!Number.isInteger(body.amount) || body.amount <= 0) throw new BadRequestException('Valid amount is required (must be positive integer in cents)');

    return this.gameService.placeBet(userId, body.amount);
  }

  @Post('bet/cashout')
  @UseGuards(JwtAuthGuard)
  async cashOut(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('User ID not found in token');

    try {
      return await this.gameService.cashOut(userId);
    } catch (error) {
      console.error('CASHOUT ERROR:', error);
      throw error;
    }
  }

  @Get('rounds/history')
  async getHistory() {
    try {
      return await this.gameService.getHistory();
    } catch (err) {
      console.error('ERROR in getHistory:', err);
      throw err;
    }
  }

  @Get('rounds/:roundId/verify')
  async verifyRound(@Param('roundId') roundId: string) {
    const round: any = await this.em.findOne('Round', roundId);
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

  @Get('bets/me')
  @UseGuards(JwtAuthGuard)
  async getMyBets(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('User ID not found in token');
    
    return this.gameService.getMyBets(userId);
  }

  @Get('health')
  check() {
    return { status: 'ok', service: 'games' };
  }
}
