import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/user/user.schema';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { BaseService } from 'src/@shared/base-service/base-service.abstract';
import {
  CreateDataResponse,
  CustomResponse,
  GetDataResponse,
  UpdateDataResponse,
} from 'src/@shared/custom-response.provider';
import { ProfileUserDto, UserDto } from './dto/get-user-profile.dto';
import { getHoroscope, getZodiac } from './user.utils';

@Injectable()
export class UserService extends BaseService<UserDocument> {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {
    super(userModel);
  }

  async getProfile(userId: string): Promise<CustomResponse<UserDto>> {
    try {
      const user = await this.findById(userId, { projection: { password: 0 } });
      return new GetDataResponse(this.mapToDto(user));
    } catch (error) {
      throw error;
    }
  }

  async createProfile(
    data: CreateUserProfileDto,
    userId: string,
  ): Promise<CustomResponse<UserDto>> {
    try {
      const { interests, ...profile } = data;
      const { dataAfter: user } = await this.update(
        { _id: userId },
        {
          profile,
          interests: interests,
        },
      );
      return new CreateDataResponse(this.mapToDto(user));
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(
    data: UpdateUserProfileDto,
    userId: string,
  ): Promise<CustomResponse<UserDto>> {
    try {
      const { interests, ...profile } = data;
      const { dataAfter: user } = await this.update(
        { _id: userId },
        {
          profile,
          interests: interests,
        },
      );
      return new UpdateDataResponse(this.mapToDto(user));
    } catch (error) {
      throw error;
    }
  }

  private mapToDto(user: UserDocument): UserDto {
    const birthdayStr = user?.profile?.birthday;
    const yearOfBirth = new Date(birthdayStr).getFullYear();
    const profile: ProfileUserDto = {
      name: user.profile.name,
      birthday: birthdayStr,
      weight: user.profile.weight,
      height: user.profile.height,
      zodiac: birthdayStr ? getZodiac(new Date(birthdayStr)) : null,
      horoscope: birthdayStr ? getHoroscope(yearOfBirth) : null,
    };
    return {
      id: `${user._id}`,
      email: user.email,
      username: user.username,
      profile: user.profile ? profile : null,
      interests: user.interests,
    };
  }
}
