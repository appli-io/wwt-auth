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

export interface INews {
  id?: string;
  headline?: string;
  slug?: string;
  abstract?: string;
  body?: string;
  category?: INewsCategory;
  isRead?: boolean;
  readTime?: number;
  images?: string[];
  publishedAt?: Date;
  updatedAt?: Date;
  createdBy?: IUser;
}
