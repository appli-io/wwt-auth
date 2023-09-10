import { ICredentials } from '@/modules/users/interfaces/credentials.interface';

export interface IUser {
  id: number;
  name: string;
  username: string;
  email: string;
  password: string;
  confirmed: boolean;
  createdAt: Date;
  updatedAt: Date;

  credentials: ICredentials;
}