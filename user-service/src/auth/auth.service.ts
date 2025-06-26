import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { UnauthorizedError } from 'src/@shared/exception/custom-error.exception';
import { JwtAuthService } from './jwt.service';
import { UserDocument } from 'src/user/schema/user.schema';
import {
  LoginRequestDto,
  LoginResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
} from './dto/auth.dto';
import {
  CreateDataResponse,
  CustomResponse,
  GetDataResponse,
} from 'src/@shared/custom-response.provider';

/**
 * AuthService handles user authentication logic,
 * including registration, login, password hashing,
 * and JWT token generation.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtAuthService: JwtAuthService,
  ) {}

  /**
   * Registers a new user with hashed password and returns JWT tokens.
   *
   * @param data - The registration payload containing email, username, and password.
   * @returns Custom response wrapping registered user info and tokens.
   * @throws Will throw an error if user creation or token generation fails.
   */
  async register(
    data: RegisterRequestDto,
  ): Promise<CustomResponse<RegisterResponseDto>> {
    try {
      const { email, username, password } = data;
      const hashPassword = this.hashPassword(password);
      const user = await this.userService.create({
        email,
        username,
        password: hashPassword,
      });

      const userForJwt = this.mapForJwt(user);
      const accessToken = await this.jwtAuthService.generateJwtToken(
        userForJwt,
        '7d',
      );
      const refreshToken = await this.jwtAuthService.generateJwtRefreshToken(
        userForJwt,
        '7d',
      );

      const response = {
        user: userForJwt,
        accessToken,
        refreshToken,
        typeToken: 'Bearer',
      };

      return new CreateDataResponse(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Authenticates a user based on email/username and password,
   * and returns JWT tokens if credentials are valid.
   *
   * @param data - The login payload containing email or username and password.
   * @returns Custom response wrapping user info and tokens.
   * @throws UnauthorizedError if user not found or password mismatch.
   */
  async login(
    data: LoginRequestDto,
  ): Promise<CustomResponse<LoginResponseDto>> {
    try {
      const { email, password, username } = data;
      const user = await this.userService.findOne({
        $or: [{ email }, { username }],
      });

      if (!user) {
        throw new UnauthorizedError('Invalid email or password');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedError();
      }

      const userForJwt = this.mapForJwt(user);
      const accessToken = await this.jwtAuthService.generateJwtToken(
        userForJwt,
        '7d',
      );
      const refreshToken = await this.jwtAuthService.generateJwtRefreshToken(
        userForJwt,
        '7d',
      );

      const response = {
        user: userForJwt,
        accessToken,
        refreshToken,
        typeToken: 'Bearer',
      };

      return new GetDataResponse(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Extracts only essential user data for use in JWT payloads.
   *
   * @param user - The user document from the database.
   * @returns A plain object with id, email, and username.
   */
  private mapForJwt(user: UserDocument) {
    return {
      id: `${user._id}`,
      email: user.email,
      username: user.username,
    };
  }

  /**
   * Hashes the raw password using bcrypt with environment-based salt.
   *
   * @param password - The plain text password to hash.
   * @returns The hashed password string.
   */
  private hashPassword(password: string): string {
    return bcrypt.hashSync(password, 10);
  }
}
