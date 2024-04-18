import { ITokenBase } from './token-base.interface';

export interface IAccessPayload {
  id: number;
  companyId?: string;
}

export interface IAccessToken extends IAccessPayload, ITokenBase {
}
