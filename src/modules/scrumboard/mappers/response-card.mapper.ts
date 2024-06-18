import { CardEntity }           from '@modules/scrumboard/entities/card.entity';
import { ResponseMemberMapper } from '@modules/scrumboard/mappers/response-member.mapper';

export class ResponseCardMapper {
  public id: string;
  public boardId: string;
  public listId: string;
  public position: number;
  public title: string;
  public description?: string | null;
  public labels?: string[];
  public dueDate?: Date;
  public owner: ResponseMemberMapper;

  constructor(values: ResponseCardMapper) {
    Object.assign(this, values);
  }

  static map(card: CardEntity): ResponseCardMapper {
    return new ResponseCardMapper({
      id: card.id,
      boardId: card.board.id,
      listId: card.list.id,
      position: card.position,
      title: card.title,
      description: card.description,
      labels: card.labels.getItems().map(label => label.id),
      dueDate: card.dueDate,
      owner: ResponseMemberMapper.map(card.owner)
    });
  }
}
