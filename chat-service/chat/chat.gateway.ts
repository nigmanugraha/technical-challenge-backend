import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageDocument } from './schema/message.schema';
import { ChatService } from './chat.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  constructor(private readonly eventEmitter: EventEmitter2) {}

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

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() data: { senderId: string; receiverId: string },
  ) {
    this.eventEmitter.emit('chat.markAsRead', data);
    this.readNotification(data.senderId, data.receiverId);
  }

  readNotification(senderId: string, receiverId: string) {
    const socketId = this.activeUsers.get(receiverId);
    const message = { senderId, receiverId };
    if (socketId) {
      this.server.to(socketId).emit('read_receipt', message);
    }
  }

  sendToUser(senderId: string, receiverId: string, content: MessageDocument) {
    const socketId = this.activeUsers.get(receiverId);
    const message = { senderId, receiverId, content };
    if (socketId) {
      this.server.to(socketId).emit('new_message', message);
    }
  }
}
