import { IImage } from '@modules/news/interfaces/news.interface';

export interface ICompany {
  id: string;
  name: string;
  username: string;
  description?: string;
  nationalId: string;
  logo?: IImage;
  email: string;
  website?: string;
  isVerified: boolean;
  isActive: boolean;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}
