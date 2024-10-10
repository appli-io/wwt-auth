import { ListEntity }         from '@modules/scrumboard/entities/list.entity';
import { ResponseCardMapper } from '@modules/scrumboard/mappers/response-card.mapper';

export class ResponseListsMapper {
  public id: string;
  public boardId: string;
  public position: number;
  public title: string;
  public cards: ResponseCardMapper[];

  constructor(values: ResponseListsMapper) {
    Object.assign(this, values);
  }

  static map(list: ListEntity): ResponseListsMapper {
    return new ResponseListsMapper({
      id: list.id,
      boardId: list.board.id,
      position: list.position,
      title: list.title,
      cards: list.cards.isInitialized() && list.cards.getItems().map(ResponseCardMapper.map),
    });
  }
}
