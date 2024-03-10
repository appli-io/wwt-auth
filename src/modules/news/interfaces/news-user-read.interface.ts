import { IUser } from '@modules/users/interfaces/user.interface';
import { INews } from '@modules/news/interfaces/news.interface';

export interface INewsUserRead {
  id: string;
  userId: IUser;
  newsId: INews;
  read_at: Date;
}
