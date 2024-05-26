import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 as uuidv4 }                                                   from 'uuid';
import { ImageEntity }                                                    from './image.entity';
import { CompanyEntity }                                                  from '../../company/entities/company.entity';
import { UserEntity }                                                     from '@modules/users/entities/user.entity';
import { IImage }                                                         from '@modules/news/interfaces/news.interface';

@Entity({tableName: 'albums'})
export class AlbumEntity {
  @PrimaryKey()
  id: string = uuidv4();

  @Property()
  name: string;

  @Property()
  description: string;

  @Property({type: 'json', nullable: true})
  cover: IImage;

  @Property({type: 'json', nullable: true})
  coverThumbnail: IImage;

  @OneToMany(() => ImageEntity, image => image.album)
  images = new Collection<ImageEntity>(this);

  @ManyToOne(() => CompanyEntity)
  company: CompanyEntity;

  @ManyToOne(() => UserEntity)
  createdBy: UserEntity;

  @Property({onCreate: () => new Date()})
  public createdAt: Date = new Date();

  @Property({onUpdate: () => new Date()})
  public updatedAt: Date = new Date();
}
