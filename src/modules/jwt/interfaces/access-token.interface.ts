import { ITokenBase } from './token-base.interface';

export interface IAccessPayload {
  id: string;
  companyId?: string;
}

export interface IAccessToken extends IAccessPayload, ITokenBase {
}
