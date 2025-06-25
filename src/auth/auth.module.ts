import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtAuthService } from './jwt.service';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './auth.service';

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, JwtAuthService, AuthService],
  exports: [JwtModule, JwtAuthService],
})
export class AuthModule {}
