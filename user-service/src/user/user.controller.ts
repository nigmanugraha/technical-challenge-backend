import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UserGuard } from 'src/auth/guard/user.guard';
import { Context } from 'src/@shared/decorator/context.decorator';
import { UserAgent } from 'src/@shared/dto/common.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { JoiValidationPipe } from 'src/@shared/joi-helper/pipe/joi-validation.pipe';
import {
  UserCreateProfileValidationSchema,
  UserFileImageValidationSchema,
  UserUpdateProfileValidationSchema,
} from './validations/user.validation';
import {
  SendMessageValidationSchema,
  ViewMessagesValidationSchema,
} from './validations/message.validation';
import { SendMessageDto, ViewMessagesDto } from './dto/message.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api')
@UseGuards(UserGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('createProfile')
  @UseInterceptors(FileInterceptor('img'))
  async createProfile(
    @Body(new JoiValidationPipe(UserCreateProfileValidationSchema))
    body: CreateUserProfileDto,
    @UploadedFile(new JoiValidationPipe(UserFileImageValidationSchema))
    img: any,
    @Context() context: UserAgent,
  ) {
    const userId = `${context.user._id}`;

    // parse height and weight to number
    body.height = parseInt(`${body.height}`);
    body.weight = parseInt(`${body.weight}`);

    if (img) body.img = img;
    return this.userService.createProfile(body, userId);
  }

  @Get('getProfile')
  async getProfile(@Context() context: UserAgent) {
    const userId = `${context.user._id}`;
    return this.userService.getProfile(userId);
  }

  @Put('updateProfile')
  @UseInterceptors(FileInterceptor('img'))
  async updateProfile(
    @Body(new JoiValidationPipe(UserUpdateProfileValidationSchema))
    body: UpdateUserProfileDto,
    @UploadedFile(new JoiValidationPipe(UserFileImageValidationSchema))
    img: any,
    @Context() context: UserAgent,
  ) {
    const userId = `${context.user._id}`;

    // parse height and weight to number
    body.height = parseInt(`${body.height}`);
    body.weight = parseInt(`${body.weight}`);

    if (img) body.img = img;
    return this.userService.updateProfile(body, userId);
  }

  @Post('sendMessage')
  async sendMessage(
    @Body(new JoiValidationPipe(SendMessageValidationSchema))
    body: SendMessageDto,
    @Context() ctx: UserAgent,
  ) {
    return this.userService.sendMessage(body, ctx);
  }

  @Get('viewMessages')
  async viewMessages(
    @Query(new JoiValidationPipe(ViewMessagesValidationSchema))
    data: ViewMessagesDto,
    @Context() ctx: UserAgent,
  ) {
    return this.userService.viewMessages(data, ctx);
  }
}
