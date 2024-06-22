import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 }                                            from 'uuid';
import { FileType }                                      from '@modules/firebase/enums/file-type.enum';
import { IImage }                                        from '@modules/news/interfaces/news.interface';
import { NewsEntity }                                    from '@modules/news/entities/news.entity';
import { CompanyEntity }                                 from '@modules/company/entities/company.entity';

@Entity({tableName: 'files'})
export class FileEntity implements IImage {
  @PrimaryKey({columnType: 'uuid'})
  public id: string = v4();

  @Enum({
    items: () => FileType,
    default: FileType.IMAGE
  })
  public type: FileType;

  @Property()
  public name: string;

  @Property()
  public filepath: string;

  @Property()
  public fileUrl: string;

  @Property()
  public contentType: string;

  @Property()
  public size: number;

  @Property({columnType: 'timestamptz', onCreate: () => new Date()})
  public createdAt: Date = new Date();

  @Property({columnType: 'timestamptz', onUpdate: () => new Date()})
  public updatedAt: Date = new Date();

  @ManyToOne(() => CompanyEntity, {nullable: false})
  public company: CompanyEntity;

  @ManyToOne({entity: () => NewsEntity, nullable: true})
  public news?: NewsEntity;
}
