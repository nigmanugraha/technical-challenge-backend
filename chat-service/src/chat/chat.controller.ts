import { Controller } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @MessagePattern('chat.send.message')
  async sendMessage(@Payload() dto: SendMessageDto) {
    try {
      return this.chatService.sendMessage(dto);
    } catch (error) {
      throw error;
    }
  }

  @MessagePattern('chat.conversation')
  async viewMessages(
    @Payload('user') user: string,
    @Payload('target') target: string,
  ) {
    return this.chatService.getConversation(user, target);
  }
}
