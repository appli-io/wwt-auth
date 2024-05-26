import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 as uuidv4 }                            from 'uuid';

import { IImage }        from '@modules/news/interfaces/news.interface';
import { UserEntity }    from '@modules/users/entities/user.entity';
import { CompanyEntity } from '../../company/entities/company.entity';
import { AlbumEntity }   from './album.entity';

@Entity({tableName: 'images'})
export class ImageEntity {
  @PrimaryKey()
  id: string = uuidv4();

  @Property({type: 'json', nullable: false})
  original: IImage;

  @Property({type: 'json', nullable: false})
  thumbnail: IImage;

  @Property()
  contentType: string;

  @Property()
  size: number;

  @ManyToOne(() => UserEntity)
  uploadedBy: UserEntity;

  @ManyToOne(() => CompanyEntity)
  company: CompanyEntity;

  @ManyToOne(() => AlbumEntity)
  album: AlbumEntity;

  @Property({onCreate: () => new Date()})
  public createdAt: Date = new Date();

  @Property({onUpdate: () => new Date()})
  public updatedAt: Date = new Date();
}
