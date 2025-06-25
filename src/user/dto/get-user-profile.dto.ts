export class UserDto {
  id: string;
  email: string;
  username: string;
  profile: ProfileUserDto;
  interests: string[];
}

export class ProfileUserDto {
  name: string;
  birthday: Date;
  horoscope: string;
  zodiac: string;
  height: number;
  weight: number;
}
