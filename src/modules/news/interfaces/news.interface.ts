/*
  NEWS {
      int id PK "Primary Key"
      int company_id FK "References COMPANY"
      int category_id FK "References CATEGORY"
      string headline "Not Null"
      string slug "Not Null"
      text abstract
      text body "Not Null"
      string[] images
      timestamp publishedAt "Not Null"
      timestamp updatedAt "Not Null"
      int createdBy FK "References USER"
  }
*/

import { INewsCategory } from '@modules/news/interfaces/news-category.interface';
import { IUser }         from '@modules/users/interfaces/user.interface';
import { ICompany }      from '@modules/company/interfaces/company.interface';

export interface INews {
  id?: string;
  headline?: string;
  slug?: string;
  abstract?: string;
  body?: string;
  category?: INewsCategory;
  companyId?: ICompany;
  // isRead?: boolean;
  images?: string[];
  publishedAt?: Date;
  updatedAt?: Date;
  createdBy?: IUser;
}
