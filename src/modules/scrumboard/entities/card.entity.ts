import { Collection, Entity, ManyToMany, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';

import { v4 } from 'uuid';

import { CompanyUserEntity } from '@modules/company-user/entities/company-user.entity';
import { BoardEntity }       from './board.entity';
import { ListEntity }        from './list.entity';
import { LabelEntity }       from './label.entity';

@Entity({tableName: 'scrumboard_card'})
export class CardEntity {
  @PrimaryKey({columnType: 'uuid'})
  id: string = v4();

  @ManyToOne(() => BoardEntity)
  board!: BoardEntity;

  @ManyToOne(() => ListEntity)
  list!: ListEntity;

  @Property()
  position!: number;

  @Property()
  title!: string;

  @Property({nullable: true})
  description?: string;

  @ManyToMany(() => LabelEntity, 'cards', {owner: true})
  labels = new Collection<LabelEntity>(this);

  // One or more responsible users
  @ManyToMany(() => CompanyUserEntity, 'assignedCards', {owner: true})
  assignees = new Collection<CompanyUserEntity>(this);

  @Property({nullable: true})
  dueDate?: Date;

  @ManyToOne({entity: () => CompanyUserEntity, inversedBy: c => c.ownedCards})
  owner!: CompanyUserEntity;

}
