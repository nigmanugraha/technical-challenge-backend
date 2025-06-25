import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { AuthGuard } from '@nestjs/passport';
import { Model } from 'mongoose';
import { UnauthorizedError } from 'src/@shared/exception/custom-error.exception';
import { UserService } from 'src/user/user.service';

@Injectable()
export class UserGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService, // Inject the JwtService
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authToken = request.headers.authorization;

    if (!authToken || !authToken.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authToken.split(' ')[1];

    try {
      // Verify the JWT token
      const decoded = this.jwtService.verify(token);
      if (decoded.type !== 'access') {
        throw new UnauthorizedError('Invalid token type');
      }

      // Find the user in the database by ID or other unique identifier and exclude the password
      const user = await this.userService.findById(decoded.id, {
        projection: { password: 0 },
      });

      if (!user) {
        throw new UnauthorizedError();
      }

      // Attach the user object to the request for further usage in the controller
      request.user = user.toObject();
      return true;
    } catch (err) {
      throw new UnauthorizedError();
    }
  }
}
