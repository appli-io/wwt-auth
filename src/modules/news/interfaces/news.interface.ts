export interface INews {
  id?: string;
  headline?: string;
  slug?: string;
  abstract?: string;
  body?: string;
  images?: IImage[];
  portraitImage?: IImage;
  isDeleted?: boolean;
  publishedAt?: Date;
  updatedAt?: Date;
}

export interface IImage {
  name: string,
  filepath: string,
  contentType: string,
  fileUrl?: string;
}
