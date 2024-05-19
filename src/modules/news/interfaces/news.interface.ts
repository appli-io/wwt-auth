import { IFile } from '@modules/firebase/interfaces/file.interface';

export interface INews {
  id?: string;
  headline?: string;
  slug?: string;
  abstract?: string;
  body?: string;
  images?: INewsImage[];
  portraitImage?: INewsImage;
  isDeleted?: boolean;
  publishedAt?: Date;
  updatedAt?: Date;
}

export interface INewsImage {
  name: string,
  filepath: string,
  contentType: string,
  file?: IFile
}
