import { IUser } from '@modules/users/interfaces/user.interface';

export interface INewsCategory {
  id?: string;
  name?: string;
  description?: string;
  image?: string;
  color?: string;
  slug?: string;
  createdBy?: IUser;
  createdAt?: Date;
  updatedBy?: IUser;
  updatedAt?: Date;
}
