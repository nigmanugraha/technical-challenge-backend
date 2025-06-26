import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Message, MessageDocument } from './schema/message.schema';
import { Model, Types } from 'mongoose';
import { SendMessageDto } from './dto/send-message.dto';
import { ChatGateway } from './chat.gateway';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private readonly chatGateway: ChatGateway,
  ) {}

  async updateReadConversation(data: { senderId: string; receiverId: string }) {
    try {
      await this.messageModel.updateMany(
        {
          sender: data.senderId,
          receiver: data.receiverId,
          isRead: false,
        },
        { isRead: true },
      );
    } catch (error) {
      throw error;
    }
  }

  async sendMessage(data: SendMessageDto) {
    try {
      const message = new this.messageModel(data);
      const saved = await message.save();
      this.chatGateway.sendToUser(data.senderId, data.receiverId, saved);
      return saved;
    } catch (error) {
      throw error;
    }
  }

  async getConversation(user: string, target: string) {
    return this.messageModel
      .find({
        $or: [
          { sender: user, receiver: target },
          { sender: target, receiver: user },
        ],
      })
      .sort({ createdAt: 1 });
  }
}
