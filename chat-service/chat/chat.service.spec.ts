// chat.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { getModelToken } from '@nestjs/mongoose';
import { ChatGateway } from './chat.gateway';
import { Message } from './schema/message.schema';

describe('ChatService', () => {
  let service: ChatService;
  let chatGatewayMock: any;

  function MockMessageModel(this: any, dto: any) {
    Object.assign(this, dto);
    this.save = jest.fn().mockResolvedValue({
      _id: '1',
      ...dto,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      __v: 0,
    });
  }

  beforeEach(async () => {
    const mockMessageStatic = {
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([{ _id: '1', text: 'Hello' }]),
      }),
    };

    chatGatewayMock = {
      sendToUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: getModelToken(Message.name),
          useValue: Object.assign(MockMessageModel, mockMessageStatic), // combine class & static
        },
        { provide: ChatGateway, useValue: chatGatewayMock },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  it('should send message and return it', async () => {
    const dto = { sender: 'u1', receiver: 'u2', content: 'hi' };

    const result = await service.sendMessage(dto as any);

    expect(result).toHaveProperty('_id');
    expect(result.sender).toBe('u1');
    expect(result.receiver).toBe('u2');
    expect(result.content).toBe('hi');

    expect(chatGatewayMock.sendToUser).toHaveBeenCalledWith(
      'u2',
      expect.objectContaining({ content: 'hi' }),
    );
  });

  it('should get conversation between two users', async () => {
    const result = await service.getConversation('u1', 'u2');

    expect(result).toEqual([{ _id: '1', text: 'Hello' }]);
  });
});
