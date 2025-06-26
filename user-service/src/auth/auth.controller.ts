import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JoiValidationPipe } from 'src/@shared/joi-helper/pipe/joi-validation.pipe';
import {
  LoginAuthValidationSchema,
  RegisterAuthValidationSchema,
} from './validations/auth.validation';
import { LoginRequestDto, RegisterRequestDto } from './dto/auth.dto';

@Controller('api')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body(new JoiValidationPipe(RegisterAuthValidationSchema))
    body: RegisterRequestDto,
  ) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(
    @Body(new JoiValidationPipe(LoginAuthValidationSchema))
    body: LoginRequestDto,
  ) {
    return this.authService.login(body);
  }
}
