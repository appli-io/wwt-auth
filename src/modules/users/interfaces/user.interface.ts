import { ICredentials } from './credentials.interface';

export interface IUser {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string;
  confirmed: boolean;
  avatar?: string;
  portrait?: string;
  location: string;
  settings: Record<string, any>;
  credentials: ICredentials;
  createdAt: Date;
  updatedAt: Date;
}
