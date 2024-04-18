import { UserEntity }    from '@modules/users/entities/user.entity';
import { CompanyEntity } from '@modules/company/entities/company.entity';

export interface IAuthResult {
  user: UserEntity;
  company?: CompanyEntity;
  accessToken: string;
  refreshToken: string;
}
