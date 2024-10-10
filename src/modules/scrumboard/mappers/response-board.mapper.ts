import { ResponseMemberMapper } from '@modules/scrumboard/mappers/response-member.mapper';
import { BoardEntity }          from '@modules/scrumboard/entities/board.entity';
import { ResponseListsMapper }  from '@modules/scrumboard/mappers/response-lists.mapper';
import { ResponseLabelMapper }  from '@modules/scrumboard/mappers/response-label.mapper';

export class ResponseBoardMapper {
  public id: string | null;
  public title: string;
  public description?: string;
  public icon?: string;
  public lastActivity: Date;
  public lists?: ResponseListsMapper[];
  public labels: ResponseLabelMapper[];
  public members: ResponseMemberMapper[];

  constructor(board: ResponseBoardMapper) {
    Object.assign(this, board);
  }

  static map(board: BoardEntity): ResponseBoardMapper {
    return new ResponseBoardMapper({
      id: board.id || null,
      title: board.title,
      description: board.description || null,
      icon: board.icon || null,
      lastActivity: board.lastActivity,
      lists: board.lists && board.lists.getItems().map(ResponseListsMapper.map),
      labels: board.labels && ResponseLabelMapper.mapAll(board.labels.getItems()),
      members: board.members.getItems().map(ResponseMemberMapper.map),
    });
  }
}
