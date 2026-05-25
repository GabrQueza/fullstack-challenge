import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: 'http://localhost:3000', credentials: true } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private stateProvider?: () => any;

  setStateProvider(provider: () => any) {
    this.stateProvider = provider;
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    if (this.stateProvider) {
      const state = this.stateProvider();
      if (state) {
        client.emit('game.state', state);
      }
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  emitGameState(state: any) {
    this.server.emit('game.state', state);
  }

  emitTick(data: any) {
    this.server.emit('game.tick', data);
  }

  emitCrash(data: any) {
    this.server.emit('game.crash', data);
  }

  emitBetPlaced(data: any) {
    this.server.emit('game.betPlaced', data);
  }
}
