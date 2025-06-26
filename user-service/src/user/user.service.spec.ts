import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';
import { getModelToken } from '@nestjs/mongoose';
import { User } from 'src/user/schema/user.schema';

// Mock helper zodiac and horoscope calculator from ./user.utils.ts
jest.mock('./user.utils', () => ({
  getZodiac: jest.fn().mockReturnValue('MockZodiac'),
  getHoroscope: jest.fn().mockReturnValue('MockHoroscope'),
}));

describe('UserService', () => {
  let service: UserService;
  let chatClientMock: ClientProxy;

  const mockUserData = {
    _id: '685ad70a8d1f3a2322341018',
    email: 'nigmanugraha@gmail.com',
    username: 'nigmanugraha',
    profile: {
      name: 'Nigma Nugraha Sistanomega',
      birthday: '1997-06-08T00:00:00.000Z',
      weight: 50,
      height: 170,
      zodiac: 'MockZodiac',
      horoscope: 'MockHoroscope',
    },
    interests: [],
  };

  function MockUserModel(this: any, dto: any) {
    Object.assign(this, mockUserData);
    this.save = jest.fn().mockResolvedValue({
      ...mockUserData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      __v: 0,
      toObject: jest.fn().mockReturnValue(mockUserData),
    });
    this.toObject = jest.fn().mockReturnValue(mockUserData);
  }

  beforeEach(async () => {
    const mockUserStatic = {
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([mockUserData]),
      }),
      findById: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        session: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUserData),
      }),
      findOneAndUpdate: jest.fn().mockResolvedValue({
        ...mockUserData,
        toObject: jest.fn().mockReturnValue(mockUserData),
      }),
    };

    chatClientMock = {
      send: jest.fn().mockReturnValue(of({ success: true })), // mock send method
      connect: jest.fn().mockResolvedValue({ success: true }), //mock connect method
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: Object.assign(MockUserModel, mockUserStatic),
        }, // dummy for BaseService
        { provide: 'CHAT_SERVICE', useValue: chatClientMock },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should get user profile', async () => {
    const userId = '685ad70a8d1f3a2322341018';
    const result = await service.getProfile(userId);
    const expectedResult = {
      meta: {
        message: 'Data was successfully retrieved!',
        status_code: 200,
      },
      data: {
        id: '685ad70a8d1f3a2322341018',
        email: 'nigmanugraha@gmail.com',
        username: 'nigmanugraha',
        profile: {
          name: 'Nigma Nugraha Sistanomega',
          birthday: '1997-06-08T00:00:00.000Z',
          weight: 50,
          height: 170,
          zodiac: 'MockZodiac',
          horoscope: 'MockHoroscope',
        },
        interests: [],
      },
    };
    expect(result).toEqual(expectedResult);
  });

  it('should create user profile', async () => {
    const userId = '685ad70a8d1f3a2322341018';
    const dto = {
      name: 'Nigma Nugraha Sistanomega',
      birthday: '1997-06-08T00:00:00.000Z',
      weight: 50,
      height: 170,
      interests: [],
    };
    const result = await service.createProfile(dto as any, userId);
    const expectedResult = {
      meta: {
        message: 'Data was successfully created!',
        status_code: 201,
      },
      data: {
        id: '685ad70a8d1f3a2322341018',
        email: 'nigmanugraha@gmail.com',
        username: 'nigmanugraha',
        profile: {
          name: 'Nigma Nugraha Sistanomega',
          birthday: '1997-06-08T00:00:00.000Z',
          weight: 50,
          height: 170,
          zodiac: 'MockZodiac',
          horoscope: 'MockHoroscope',
        },
        interests: [],
      },
    };
    expect(result).toEqual(expectedResult);
  });

  it('should update user profile', async () => {
    const userId = '685ad70a8d1f3a2322341018';
    const dto = {
      name: 'Nigma Nugraha Sistanomega',
      birthday: '1997-06-08T00:00:00.000Z',
      weight: 50,
      height: 170,
      interests: [],
    };
    const result = await service.updateProfile(dto as any, userId);
    const expectedResult = {
      meta: {
        message: 'Data was successfully updated!',
        status_code: 200,
      },
      data: {
        id: '685ad70a8d1f3a2322341018',
        email: 'nigmanugraha@gmail.com',
        username: 'nigmanugraha',
        profile: {
          name: 'Nigma Nugraha Sistanomega',
          birthday: '1997-06-08T00:00:00.000Z',
          weight: 50,
          height: 170,
          zodiac: 'MockZodiac',
          horoscope: 'MockHoroscope',
        },
        interests: [],
      },
    };
    expect(result).toEqual(expectedResult);
  });

  it('should convert UserDocument to UserDto correctly', () => {
    const mockUserData: any = {
      _id: '685ad70a8d1f3a2322341018',
      email: 'nigmanugraha@gmail.com',
      username: 'nigmanugraha',
      profile: {
        name: 'Nigma Nugraha Sistanomega',
        birthday: '1997-06-08T00:00:00.000Z',
        weight: 50,
        height: 170,
      },
      interests: [],
    };

    const result = service['mapToDto'](mockUserData); // akses private pakai []
    const expectedResult = {
      id: '685ad70a8d1f3a2322341018',
      email: 'nigmanugraha@gmail.com',
      username: 'nigmanugraha',
      profile: {
        name: 'Nigma Nugraha Sistanomega',
        birthday: '1997-06-08T00:00:00.000Z',
        weight: 50,
        height: 170,
        zodiac: 'MockZodiac',
        horoscope: 'MockHoroscope',
      },
      interests: [],
    };
    expect(result).toEqual(expectedResult);
  });

  it('should return null profile if user.profile is undefined', () => {
    const mockUserData: any = {
      _id: '685ad70a8d1f3a2322341018',
      email: 'nigmanugraha@gmail.com',
      username: 'nigmanugraha',
      profile: null,
      interests: [],
    };

    const result = service['mapToDto'](mockUserData);
    expect(result.profile).toBeNull();
  });

  it('should send message through chat service', async () => {
    const dto = { content: 'Hello', receiverId: 'u2' };
    const ctx = { user: { _id: 'u1' } };
    const result = await service.sendMessage(dto as any, ctx as any);

    const expectedResult = {
      meta: {
        message: 'Data was successfully created!',
        status_code: 201,
      },
      data: { success: true },
    };
    const expectedChatResult = {
      senderId: ctx.user._id,
      receiverId: dto.receiverId,
      content: dto.content,
    };

    expect(result).toEqual(expectedResult);
    expect(chatClientMock.send).toHaveBeenCalledWith(
      'chat.send.message',
      expectedChatResult,
    );
  });
});
