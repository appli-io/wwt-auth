import { ResponseMemberMapper } from '@modules/scrumboard/mappers/response-member.mapper';
import { BoardEntity }          from '@modules/scrumboard/entities/board.entity';

export class ResponseBoardsMapper {
  public id: string;
  public title: string;
  public description: string;
  public icon: string;
  public lastActivity: Date;
  public members: ResponseMemberMapper[];
  public ownerId: string;

  constructor(values: ResponseBoardsMapper) {
    Object.assign(this, values);
  }

  static map(board: BoardEntity): ResponseBoardsMapper {
    return new ResponseBoardsMapper({
      id: board.id,
      title: board.title,
      description: board.description,
      icon: board.icon,
      lastActivity: board.lastActivity,
      members: board.members.getItems().map(ResponseMemberMapper.map),
      ownerId: board.owner?.user.id,
    });
  }
}
