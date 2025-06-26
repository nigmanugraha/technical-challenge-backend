export class LoginResponseDto {
  user: {
    id: string;
    email: string;
    username: string;
  };
  accessToken: string;
  refreshToken: string;
  typeToken: string;
}

export type RegisterResponseDto = LoginResponseDto;

export class LoginRequestDto {
  email: string;
  username: string;
  password: string;
}

export class RegisterRequestDto {
  email: string;
  username: string;
  password: string;
  secondPassword: string;
}
