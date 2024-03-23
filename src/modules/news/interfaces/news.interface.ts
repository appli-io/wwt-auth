export interface INews {
  id?: string;
  headline?: string;
  slug?: string;
  abstract?: string;
  body?: string;
  images?: string[];
  isDeleted?: boolean;
  publishedAt?: Date;
  updatedAt?: Date;
}
