export interface INews {
  id?: string;
  headline?: string;
  slug?: string;
  abstract?: string;
  body?: Record<string, unknown>;
  isDeleted?: boolean;
  publishedAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface IImage {
  id: string;
  name: string;
  filepath: string;
  fileUrl: string;
  contentType: string;
  size: number;
}
