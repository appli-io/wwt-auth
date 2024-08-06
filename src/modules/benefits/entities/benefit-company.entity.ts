import { Entity, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { FileEntity }                             from '@modules/firebase/entities/file.entity';
import { v4 }                                     from 'uuid';

@Entity({tableName: 'benefit_companies'})
export class BenefitCompanyEntity {
  @PrimaryKey({type: 'uuid'})
  id: string = v4();

  @Property()
  name!: string;

  @OneToOne({entity: () => FileEntity, nullable: true, eager: true})
  image!: FileEntity;
}
