import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';

import { ILike }       from '@modules/likes/interface/like.interface';
import { ContentType } from '@modules/shared/enums/content-type.enum';
import { UserEntity }  from '@modules/users/entities/user.entity';

@Entity({tableName: 'likes'})
export class LikeEntity implements ILike {
  @PrimaryKey({columnType: 'uuid'})
  id: string;

  @ManyToOne(() => UserEntity)
  userId: UserEntity;

  @Property({nullable: false})
  contentType: ContentType;

  @Property({nullable: false})
  contentId: string;

  @Property({columnType: 'boolean', default: false})
  isDeleted: boolean;

  @Property({onCreate: () => new Date()})
  createdAt: Date;

  @Property({onUpdate: () => new Date()})
  updatedAt: Date;
}
