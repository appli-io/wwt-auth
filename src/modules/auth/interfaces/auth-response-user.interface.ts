import { ResponseCompanyUserMapper } from '@modules/auth/mappers/response-company-user.mapper';
import { CompanyEntity }             from '@modules/company/entities/company.entity';

export interface IAuthResponseUser {
  id: number;
  name: string;
  username: string;
  avatar: string;
  email: string;
  settings: Record<string, any>;
  positions?: ResponseCompanyUserMapper[];
  assignedCompanies?: Partial<CompanyEntity>[];
  location: string;
}
