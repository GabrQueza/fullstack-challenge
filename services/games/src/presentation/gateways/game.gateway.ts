import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
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
