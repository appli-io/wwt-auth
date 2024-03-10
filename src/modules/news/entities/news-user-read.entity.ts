import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { UserEntity }                              from '@modules/users/entities/user.entity';
import { NewsEntity }                              from '@modules/news/entities/news.entity';

@Entity({tableName: 'news_user_read'})
export class NewsUserReadEntity {
  @PrimaryKey({columnType: 'uuid'})
  id: string;

  @ManyToOne(() => UserEntity)
  userId: UserEntity;

  @ManyToOne(() => NewsEntity)
  newsId: NewsEntity;

  @Property({onCreate: () => new Date()})
  readAt: Date;
}
