import { Collection, Entity, ManyToMany, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';

import { BoardEntity } from './board.entity';
import { ListEntity }  from './list.entity';
import { LabelEntity } from './label.entity';

@Entity({tableName: 'scrumboard_card'})
export class CardEntity {
  @PrimaryKey()
  id!: string;

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

  @ManyToMany(() => LabelEntity, 'cards')
  labels = new Collection<LabelEntity>(this);

  @Property({nullable: true})
  dueDate?: Date;
}
