import { UserEntity } from '@modules/users/entities/user.entity';

export interface IAuthResult {
  user: UserEntity;
  accessToken: string;
  refreshToken: string;
}
