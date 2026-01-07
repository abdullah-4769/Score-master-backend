// src/websocket/websocket.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WebsocketService } from './websocket.service';

@WebSocketGateway({ cors: true })
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private wsService: WebsocketService) {}

  handleConnection(client: Socket) {
    const userId = Number(client.handshake.query.userId);
    if (userId) {
      this.wsService.registerClient(userId, client);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = Number(client.handshake.query.userId);
    if (userId) {
      this.wsService.removeClient(userId);
    }
  }

  // User joins a session room
  @SubscribeMessage('joinSession')
  handleJoinSession(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket
  ) {
    const userId = client.data.userId;
    if (userId && data.sessionId) {
      this.wsService.addUserToSession(userId, data.sessionId);
      client.emit('joinedSession', { sessionId: data.sessionId });
    }
  }

  // Send message to session room
  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: { message: string, sessionId: string },
    @ConnectedSocket() client: Socket
  ) {
    const sessionId = data.sessionId;
    if (sessionId) {
      this.server.to(`session-${sessionId}`).emit('message', {
        message: data.message,
        senderId: client.data.userId,
        sessionId: sessionId
      });
    }
  }
}
