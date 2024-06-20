import { Collection, Entity, ManyToMany, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';

import { v4 } from 'uuid';

import { BoardEntity } from './board.entity';
import { CardEntity }  from './card.entity';

@Entity({tableName: 'scrumboard_label'})
export class LabelEntity {
  @PrimaryKey({columnType: 'uuid'})
  id: string = v4();

  @ManyToOne(() => BoardEntity)
  board!: BoardEntity;

  @Property()
  title!: string;

  @ManyToMany({entity: () => CardEntity, mappedBy: 'labels', owner: true})
  public cards = new Collection<CardEntity>(this);
}
