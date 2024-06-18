import { CardEntity } from '@modules/scrumboard/entities/card.entity';
import { ListEntity } from '@modules/scrumboard/entities/list.entity';

export class ResponseListsMapper {
  public id: string;
  public boardId: string;
  public position: number;
  public title: string;
  public cards: CardEntity[];

  constructor(values: ResponseListsMapper) {
    Object.assign(this, values);
  }

  static map(list: ListEntity): ResponseListsMapper {
    return new ResponseListsMapper({
      id: list.id,
      boardId: list.board.id,
      position: list.position,
      title: list.title,
      cards: list.cards.getItems(),
    });
  }
}
