import { Collection, Entity, ManyToMany, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { ListEntity }                                                      from './list.entity';
import { LabelEntity }                                                     from './label.entity';
import { CompanyUserEntity }                                               from '@modules/company-user/entities/company-user.entity';
import { v4 }                                                              from 'uuid';

@Entity({tableName: 'scrumboard_board'})
export class BoardEntity {
  @PrimaryKey()
  id: string = v4();

  @Property()
  title!: string;

  @Property({nullable: true})
  description?: string;

  @Property({nullable: true})
  icon?: string;

  @Property({nullable: true})
  lastActivity?: Date;

  @Property({nullable: true, onCreate: () => new Date()})
  createdAt: Date;

  @OneToMany(() => ListEntity, list => list.board)
  lists = new Collection<ListEntity>(this);

  @OneToMany(() => LabelEntity, label => label.board)
  labels = new Collection<LabelEntity>(this);

  @ManyToMany({entity: () => CompanyUserEntity, mappedBy: 'boards', owner: true})
  members = new Collection<CompanyUserEntity>(this);
}
