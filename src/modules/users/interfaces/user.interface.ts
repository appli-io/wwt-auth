import { IFile } from '@modules/firebase/interfaces/file.interface';
import { ICredentials } from './credentials.interface';

export interface IUser {
  id: number;
  name: string;
  username: string;
  email: string;
  password: string;
  confirmed: boolean;
  avatar?: string | IFile;
  portrait?: string;
  location: string;
  settings: Record<string, any>;
  credentials: ICredentials;
  createdAt: Date;
  updatedAt: Date;
}
