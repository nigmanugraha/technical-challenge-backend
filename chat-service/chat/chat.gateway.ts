import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer() server: Server;
  private activeUsers = new Map<string, string>(); // userId → socketId

  handleConnection(socket: Socket) {
    const userId = socket.handshake.query.userId as string;
    if (userId) this.activeUsers.set(userId, socket.id);
  }

  handleDisconnect(socket: Socket) {
    for (const [userId, sockId] of this.activeUsers) {
      if (sockId === socket.id) {
        this.activeUsers.delete(userId);
        break;
      }
    }
  }

  sendToUser(userId: string, message: any) {
    const socketId = this.activeUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('new_message', message);
    }
  }
}
