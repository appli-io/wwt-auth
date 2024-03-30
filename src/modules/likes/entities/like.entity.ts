import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';

import { v4 } from 'uuid';

import { ILike }       from '@modules/likes/interface/like.interface';
import { ContentType } from '@modules/shared/enums/content-type.enum';
import { UserEntity }  from '@modules/users/entities/user.entity';

@Entity({tableName: 'likes'})
export class LikeEntity implements ILike {
  @PrimaryKey()
  public id: string = v4()

  @Property({nullable: false})
  public contentType: ContentType;

  @Property({nullable: false})
  public contentId: string;

  @Property({columnType: 'boolean', default: false})
  public isDeleted?: boolean;

  @Property({onCreate: () => new Date()})
  public createdAt: Date;

  @Property({onUpdate: () => new Date()})
  public updatedAt: Date;

  @ManyToOne(() => UserEntity)
  public createdBy: UserEntity;
}
