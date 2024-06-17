import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';

import { BoardEntity } from './board.entity';
import { CardEntity }  from './card.entity';
import { v4 }          from 'uuid';

@Entity({tableName: 'scrumboard_list'})
export class ListEntity {
  @PrimaryKey()
  id: string = v4();

  @ManyToOne(() => BoardEntity)
  board!: BoardEntity;

  @Property()
  position!: number;

  @Property()
  title!: string;

  @OneToMany(() => CardEntity, card => card.list)
  cards = new Collection<CardEntity>(this);
}
