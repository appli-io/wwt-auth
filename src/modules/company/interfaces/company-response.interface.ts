import { ResponseUserMapper } from '@modules/users/mappers/response-user.mapper';

export interface ICompanyResponse {
  id: string;
  name: string;
  username: string;
  description?: string;
  nationalId: string;
  logo?: string;
  email: string;
  website?: string;
  owner: ResponseUserMapper;
  users: ResponseUserMapper[];
  isVerified: boolean;
  isActive: boolean;
  country: string;
  createdAt: Date;
}
