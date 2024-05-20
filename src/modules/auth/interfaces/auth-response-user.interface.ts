import { ResponsePositionsMapper } from '@modules/auth/mappers/response-positions.mapper';
import { CompanyEntity }           from '@modules/company/entities/company.entity';
import { IFile }                   from '@modules/firebase/interfaces/file.interface';

export interface IAuthResponseUser {
  id: string;
  name: string;
  username: string;
  avatar: string | IFile;
  email: string;
  settings: Record<string, any>;
  positions?: ResponsePositionsMapper[];
  assignedCompanies?: Partial<CompanyEntity>[];
  location: string;
}
