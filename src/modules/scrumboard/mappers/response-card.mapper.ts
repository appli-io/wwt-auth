import { CardEntity }           from '@modules/scrumboard/entities/card.entity';
import { ResponseMemberMapper } from '@modules/scrumboard/mappers/response-member.mapper';
import { ResponseLabelMapper }  from '@modules/scrumboard/mappers/response-label.mapper';

export class ResponseCardMapper {
  public id: string;
  public boardId: string;
  public listId: string;
  public position: number;
  public title: string;
  public description?: string | null;
  public labels?: ResponseLabelMapper[];
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
      labels: card.labels.isInitialized() && ResponseLabelMapper.mapAll(card.labels.getItems()),
      dueDate: card.dueDate,
      owner: ResponseMemberMapper.map(card.owner)
    });
  }
}
