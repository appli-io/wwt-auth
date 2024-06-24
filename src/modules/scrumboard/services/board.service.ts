import { Injectable }        from '@nestjs/common';
import { InjectRepository }  from '@mikro-orm/nestjs';
import { BoardEntity }       from '@modules/scrumboard/entities/board.entity';
import { EntityRepository }  from '@mikro-orm/postgresql';
import { CreateBoardDto }    from '@modules/scrumboard/dtos/create-board.dto';
import { EntityManager }     from '@mikro-orm/core';
import { UpdateBoardDto }    from '@modules/scrumboard/dtos/update-board.dto';
import { CompanyEntity }     from '@modules/company/entities/company.entity';
import { UserEntity }        from '@modules/users/entities/user.entity';
import { CompanyUserEntity } from '@modules/company-user/entities/company-user.entity';
import { SCRUMBOARD_STEPS }  from '@common/constant';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(BoardEntity) private readonly _boardRepository: EntityRepository<BoardEntity>,
    private readonly _em: EntityManager,
  ) {}

  async create(createBoardDto: CreateBoardDto, companyUser: CompanyUserEntity, companyId: CompanyEntity['id']) {
    const board = this._boardRepository.create({
      ...createBoardDto,
      company: companyId,
      lastActivity: new Date(),
      lists: [
        {title: 'To Do', position: SCRUMBOARD_STEPS},
        {title: 'In Progress', position: SCRUMBOARD_STEPS * 2},
        {title: 'Done', position: SCRUMBOARD_STEPS * 3},
        {title: 'Blocked', position: SCRUMBOARD_STEPS * 4}
      ]
    });
    board.members.add(companyUser);

    await this._em.persistAndFlush(board);

    console.log('board', board);
    return await this._em.refresh(board);
  }

  findAll(userId: UserEntity['id'], companyId: CompanyEntity['id']) {
    return this._boardRepository.findAll({
      where: {company: companyId, members: {user: userId}},
      populate: [ 'members', 'members.user' ],
      orderBy: {lastActivity: 'desc'}
    });
  }

  findOne(id: string) {
    return this._boardRepository.findOne(
      id,
      {
        populate: [ 'members', 'members.user', 'lists', 'lists.cards', 'labels' ],
        orderBy: {lists: {cards: {position: 'asc'}}}
      }
    );
  }

  update(id: string, updateBoardDto: UpdateBoardDto) {
    return this._boardRepository.nativeUpdate({id}, updateBoardDto);
  }

  remove(id: string) {
    return this._boardRepository.nativeDelete({id});
  }
}
