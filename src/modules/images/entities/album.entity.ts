import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 as uuidv4 }                                                   from 'uuid';
import { ImageEntity }                                                    from './image.entity';
import { CompanyEntity }                                                  from '../../company/entities/company.entity';

@Entity({tableName: 'albums'})
export class AlbumEntity {
  @PrimaryKey()
  id: string = uuidv4();

  @Property()
  name: string;

  @ManyToOne(() => CompanyEntity)
  company: CompanyEntity;

  @OneToMany(() => ImageEntity, image => image.album)
  images = new Collection<ImageEntity>(this);
}
