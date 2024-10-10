import { Collection, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";

import { v4 } from "uuid";

import { CompanyEntity } from "@modules/company/entities/company.entity";
import { CompanyUserEntity } from "@modules/company-user/entities/company-user.entity";
import { LabelEntity } from "./label.entity";
import { ListEntity } from "./list.entity";

@Entity({tableName: 'scrumboard_board'})
export class BoardEntity {
  @PrimaryKey({columnType: 'uuid'})
  id: string = v4();

  @Property()
  title!: string;

  @Property({columnType: 'text', nullable: true})
  description?: string;

  @Property({nullable: true})
  icon?: string;

  @Property({nullable: true})
  lastActivity?: Date;

  @Property({nullable: true, onCreate: () => new Date()})
  createdAt: Date;

  @ManyToOne(() => CompanyUserEntity, {nullable: true, eager: true})
  owner: CompanyUserEntity;

  @ManyToOne(() => CompanyEntity)
  company!: CompanyEntity;

  @OneToMany(() => ListEntity, list => list.board)
  lists = new Collection<ListEntity>(this);

  @OneToMany(() => LabelEntity, label => label.board)
  labels = new Collection<LabelEntity>(this);

  @ManyToMany({entity: () => CompanyUserEntity, mappedBy: 'boards', owner: true})
  members = new Collection<CompanyUserEntity>(this);
}
