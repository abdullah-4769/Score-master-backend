// src/websocket/websocket.service.ts
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class WebsocketService {
  private clients: Map<number, Socket> = new Map(); // userId -> socket

  registerClient(userId: number, client: Socket) {
    this.clients.set(userId, client);
    client.data.userId = userId;
  }

  removeClient(userId: number) {
    this.clients.delete(userId);
  }

  getClientByUserId(userId: number): Socket | undefined {
    return this.clients.get(userId);
  }

  // Add user to a session-based chat room
  addUserToSession(userId: number, sessionId: string) {
    const client = this.getClientByUserId(userId);
    if (client) {
      client.join(`session-${sessionId}`);
      client.data.sessionId = sessionId; // keep track of which session user is in
    }
  }
}
