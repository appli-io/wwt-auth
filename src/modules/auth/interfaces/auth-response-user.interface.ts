import { ResponsePositionsMapper } from '@modules/auth/mappers/response-positions.mapper';
import { CompanyEntity }           from '@modules/company/entities/company.entity';
import { IImage }                  from '@modules/news/interfaces/news.interface';

export interface IAuthResponseUser {
  id: string;
  name: string;
  username: string;
  avatar: IImage;
  email: string;
  settings: Record<string, any>;
  positions?: ResponsePositionsMapper[];
  assignedCompanies?: Partial<CompanyEntity>[];
  location: string;
}
