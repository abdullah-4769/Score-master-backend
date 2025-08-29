import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // adjust for your frontend
  },
})
export class SessionGateway {
  @WebSocketServer()
  server: Server;

  // Called when a player wants to join a session room
  joinSessionRoom(socket: Socket, sessionId: number, playerName: string) {
    const room = `session_${sessionId}`;
    socket.join(room);

    // Notify everyone in the room
    this.server.to(room).emit('playerJoined', {
      playerName,
      sessionId,
      message: `${playerName} has joined the session.`,
    });
  }

  // Optional: listen for chat messages
  @SubscribeMessage('sendMessage')
  handleMessage(
    @MessageBody() data: { sessionId: number; message: string; playerName: string },
  ) {
    const room = `session_${data.sessionId}`;
    this.server.to(room).emit('newMessage', {
      playerName: data.playerName,
      message: data.message,
    });
  }
}
