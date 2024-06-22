export interface INews {
  id?: string;
  headline?: string;
  slug?: string;
  abstract?: string;
  body?: string;
  isDeleted?: boolean;
  publishedAt?: Date;
  updatedAt?: Date;
}

export interface IImage {
  id: string;
  name: string,
  filepath: string,
  fileUrl: string;
  contentType: string,
  size: number;
}
