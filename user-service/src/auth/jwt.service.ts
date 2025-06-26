import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthService {
  constructor(private readonly jwtService: JwtService) {}
  async generateJwtToken(user: any, expiresIn?: string): Promise<string> {
    return this.jwtService.signAsync(
      {
        ...user,
        type: 'access',
      },
      {
        expiresIn,
        issuer: 'tech',
        subject: user.id,
      },
    );
  }

  async generateJwtRefreshToken(
    user: any,
    expiresIn?: string,
  ): Promise<string> {
    return this.jwtService.signAsync(
      {
        type: 'refresh',
      },
      {
        expiresIn,
        issuer: 'tech',
        subject: user.id,
      },
    );
  }
}
