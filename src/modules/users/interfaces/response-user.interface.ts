import { IImage } from '@modules/news/interfaces/news.interface';

export interface IResponseUser {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: IImage;
  position: string;
  location: string;
}
