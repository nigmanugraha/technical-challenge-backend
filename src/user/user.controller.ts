import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UserGuard } from 'src/auth/guard/user.guard';
import { Context } from 'src/@shared/decorator/context.decorator';
import { UserAgent } from 'src/@shared/dto/common.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { JoiValidationPipe } from 'src/@shared/joi-helper/pipe/joi-validation.pipe';
import {
  UserCreateProfileValidationSchema,
  UserUpdateProfileValidationSchema,
} from './validations/user.validation';

@Controller('api')
@UseGuards(UserGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('createProfile')
  async createProfile(
    @Body(new JoiValidationPipe(UserCreateProfileValidationSchema))
    body: CreateUserProfileDto,
    @Context() context: UserAgent,
  ) {
    const userId = `${context.user._id}`;
    return this.userService.createProfile(body, userId);
  }

  @Get('getProfile')
  async getProfile(@Context() context: UserAgent) {
    const userId = `${context.user._id}`;
    return this.userService.getProfile(userId);
  }

  @Put('updateProfile')
  async updateProfile(
    @Body(new JoiValidationPipe(UserUpdateProfileValidationSchema))
    body: UpdateUserProfileDto,
    @Context() context: UserAgent,
  ) {
    const userId = `${context.user._id}`;
    return this.userService.updateProfile(body, userId);
  }
}
