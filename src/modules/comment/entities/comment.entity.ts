import { Entity, ManyToOne, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { IComment }                                          from '@modules/comment/interfaces/comment.interface';
import { UserEntity }                              from '@modules/users/entities/user.entity';
import { ContentType }                             from '@modules/shared/enums/content-type.enum';

@Entity({tableName: 'comments'})
export class CommentEntity implements IComment {
  @PrimaryKey({columnType: 'uuid'})
  public id: string;

  @Property({nullable: false})
  public content: string;

  @Property({nullable: false})
  public contentType: ContentType;

  @Property({nullable: false})
  public contentId: string;

  @Property({columnType: 'boolean', default: false})
  public isDeleted: boolean;

  @OneToOne(() => CommentEntity, {nullable: true})
  public parent: CommentEntity;

  @ManyToOne(() => UserEntity)
  public createdBy: UserEntity;

  @Property({onCreate: () => new Date()})
  public createdAt: Date;

  @Property({onUpdate: () => new Date()})
  public updatedAt: Date;
}
