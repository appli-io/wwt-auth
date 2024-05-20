import { ResponseUserMapper } from '@modules/users/mappers/response-user.mapper';
import { IImage }             from '@modules/news/interfaces/news.interface';

export interface ICompanyResponse {
  id: string;
  name: string;
  username: string;
  description?: string;
  nationalId: string;
  logo?: IImage;
  email: string;
  website?: string;
  owner: ResponseUserMapper;
  isVerified: boolean;
  isActive: boolean;
  country: string;
  createdAt: Date;
}
