import { Controller } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { WalletService } from '../../application/wallet.service';
import { PlaceBetPayload, CashOutPayload } from '@crash/types';
import { InsufficientBalanceException } from '../../domain/exceptions/insufficient-balance.exception';

@Controller()
export class WalletEventsController {
  constructor(private readonly walletService: WalletService) {}

  @EventPattern('bet.placed')
  async handleBetPlaced(@Payload() data: PlaceBetPayload, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    
    try {
      // Safely convert amount to BigInt
      const amountBigInt = BigInt(data.amount);
      await this.walletService.processBetPlaced(data.userId, amountBigInt);
      // ACK message on success
      channel.ack(originalMsg);
    } catch (error) {
      console.error(`Error processing bet.placed for user ${data.userId}: ${error.message}`);
      if (error instanceof InsufficientBalanceException) {
        // Business error: DO NOT requeue, just acknowledge to remove from queue
        // In a real app we might emit a 'bet.failed' event back to the game service.
        channel.ack(originalMsg);
      } else {
        // Infrastructure/transient error: NACK and possibly requeue
        channel.nack(originalMsg, false, false); // No requeue for now to prevent infinite loops, but in prod could be true
      }
    }
  }

  @EventPattern('bet.won')
  async handleBetWon(@Payload() data: CashOutPayload, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    
    try {
      const amountBigInt = BigInt(data.amount);
      await this.walletService.processBetWon(data.userId, amountBigInt);
      channel.ack(originalMsg);
    } catch (error) {
      console.error(`Error processing bet.won for user ${data.userId}: ${error.message}`);
      channel.nack(originalMsg, false, false);
    }
  }
}
