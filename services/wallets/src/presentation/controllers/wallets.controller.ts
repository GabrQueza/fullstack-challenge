import { Controller, Post, Get, Body, Headers, BadRequestException } from '@nestjs/common';
import { WalletService } from '../../application/wallet.service';

export class CreateWalletDto {
  userId: string;
}

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  async create(@Body() body: CreateWalletDto) {
    if (!body.userId) throw new BadRequestException('userId is required');
    const wallet = await this.walletService.createWallet(body.userId);
    return {
      id: wallet.id,
      userId: wallet.userId,
      balance: wallet.balance.toString(), // Convert bigint to string for JSON serialization
      createdAt: wallet.createdAt,
    };
  }

  @Get('me')
  async getMe(@Headers('x-user-id') userId: string) {
    if (!userId) throw new BadRequestException('x-user-id header is required');
    const wallet = await this.walletService.getWallet(userId);
    return {
      id: wallet.id,
      userId: wallet.userId,
      balance: wallet.balance.toString(),
      createdAt: wallet.createdAt,
    };
  }

  @Get('health')
  check() {
    return { status: 'ok', service: 'wallets' };
  }
}
