import { IUser }       from '@modules/users/interfaces/user.interface';
import { ContentType } from '@modules/shared/enums/content-type.enum';

export interface ILike {
  id: string;
  createdBy: IUser | number;
  contentType: ContentType;
  contentId: string;
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
