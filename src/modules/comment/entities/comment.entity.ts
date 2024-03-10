import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { IComment }                                from '@modules/comment/interfaces/comment.interface';
import { UserEntity }                              from '@modules/users/entities/user.entity';
import { ContentType }                             from '@modules/shared/enums/content-type.enum';

@Entity({tableName: 'comments'})
export class CommentEntity implements IComment {
  @PrimaryKey({columnType: 'uuid'})
  id: string;

  @ManyToOne(() => UserEntity)
  userId: UserEntity;

  @Property({nullable: false})
  content: string;

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
