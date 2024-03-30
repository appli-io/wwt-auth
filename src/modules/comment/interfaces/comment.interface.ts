import { IUser }       from '@modules/users/interfaces/user.interface';
import { ContentType } from '@modules/shared/enums/content-type.enum';

export interface IComment {
  id: string;
  content: string;
  contentType: ContentType;
  contentId: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
