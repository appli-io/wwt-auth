import { IAuthResponseUser } from './auth-response-user.interface';
import { ICompanyResponse }  from '@modules/company/interfaces/company-response.interface';

export interface IAuthResponse {
  user: IAuthResponseUser;
  company?: ICompanyResponse;
  accessToken: string;
}
