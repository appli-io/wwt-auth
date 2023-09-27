import { ICredentials } from './credentials.interface';

export interface IUser {
  id: number;
  name: string;
  username: string;
  email: string;
  password: string;
  confirmed: boolean;
  avatar: string;
  settings: Record<string, any>;
  credentials: ICredentials;
  createdAt: Date;
  updatedAt: Date;
}
