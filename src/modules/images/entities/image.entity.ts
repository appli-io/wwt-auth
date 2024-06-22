import { Entity, ManyToOne, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 }                                                from 'uuid';
import { UserEntity }                                        from '@modules/users/entities/user.entity';
import { CompanyEntity }                                     from '../../company/entities/company.entity';
import { AlbumEntity }                                       from './album.entity';
import { FileEntity }                                        from '@modules/firebase/entities/file.entity';

@Entity({tableName: 'albums_images'})
export class ImageEntity {
  @PrimaryKey()
  id: string = v4();

  @Property()
  size: number;

  @OneToOne({entity: () => FileEntity, nullable: false})
  original: FileEntity;

  @OneToOne({entity: () => FileEntity, nullable: true})
  thumbnail?: FileEntity;

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
