import { ICredentials } from './credentials.interface';
import { IImage }       from '@modules/news/interfaces/news.interface';

export interface IUser {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string;
  confirmed: boolean;
  avatar?: IImage;
  portrait?: string;
  location: string;
  settings: Record<string, any>;
  credentials: ICredentials;
  createdAt: Date;
  updatedAt: Date;
}
