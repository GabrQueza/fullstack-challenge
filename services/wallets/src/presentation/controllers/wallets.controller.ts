import { Controller, Post, Get, Body, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { WalletService } from '../../application/wallet.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('User ID not found in token');
    const wallet = await this.walletService.createWallet(userId);
    return {
      id: wallet.id,
      userId: wallet.userId,
      balance: wallet.balance.toString(), // Convert bigint to string for JSON serialization
      createdAt: wallet.createdAt,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('User ID not found in token');
    
    let wallet;
    try {
      wallet = await this.walletService.getWallet(userId);
    } catch (error: any) {
      if (error.status === 404 || error.message === 'Wallet not found') {
        wallet = await this.walletService.createWallet(userId);
      } else {
        throw error;
      }
    }
    
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
