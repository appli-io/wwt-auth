import { IUser } from '@modules/users/interfaces/user.interface';

export interface ICompany {
  id: string;
  name: string;
  username: string;
  description: string;
  nationalId: string;
  logo: string;
  email: string;
  website: string;
  owner: IUser;
  isVerified: boolean;
  isActive: boolean;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}
