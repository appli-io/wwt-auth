import { ResponsePositionsMapper } from '@modules/auth/mappers/response-positions.mapper';
import { CompanyEntity }           from '@modules/company/entities/company.entity';

export interface IAuthResponseUser {
  id: number;
  name: string;
  username: string;
  avatar: string;
  email: string;
  settings: Record<string, any>;
  positions?: ResponsePositionsMapper[];
  assignedCompanies?: Partial<CompanyEntity>[];
  location: string;
}
