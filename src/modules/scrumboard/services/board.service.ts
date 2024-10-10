import { Injectable, Logger } from '@nestjs/common';

import { EntityManager }    from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';

import { SCRUMBOARD_STEPS }  from '@common/constant';
import { CompanyEntity }     from '@modules/company/entities/company.entity';
import { CompanyUserEntity } from '@modules/company-user/entities/company-user.entity';
import { BoardEntity }       from '@modules/scrumboard/entities/board.entity';
import { CreateBoardDto }    from '@modules/scrumboard/dtos/create-board.dto';
import { UserEntity }        from '@modules/users/entities/user.entity';
import { CommonService }     from '@common/common.service';

@Injectable()
export class BoardService {
  private _logger = new Logger(BoardService.name);

  constructor(
    @InjectRepository(BoardEntity) private readonly _boardRepository: EntityRepository<BoardEntity>,
    private readonly _commonService: CommonService,
    private readonly _em: EntityManager,
  ) {}

  async create(createBoardDto: CreateBoardDto, companyUser: CompanyUserEntity, companyId: CompanyEntity['id']) {
    const board = this._boardRepository.create({
      ...createBoardDto,
      company: companyId,
      lastActivity: new Date(),
      members: createBoardDto.members.map((memberId) => this._em.getReference('CompanyUserEntity', {user: memberId, company: companyId})),
      owner: companyUser,
      lists: [
        {title: 'To Do', position: SCRUMBOARD_STEPS},
        {title: 'In Progress', position: SCRUMBOARD_STEPS * 2},
        {title: 'Done', position: SCRUMBOARD_STEPS * 3},
        {title: 'Blocked', position: SCRUMBOARD_STEPS * 4}
      ]
    });

    this._logger.log('board', JSON.stringify(board));

    board.members.add(companyUser);

    await this._em.persistAndFlush(board);

    return await this.findOne(board.id);
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
        populate: [ 'members', 'members.user', 'lists', 'lists.cards.labels', 'labels' ],
        orderBy: {
          lists: {
            position: 'asc',
            cards: {
              position: 'asc'
            }
          }
        }
      }
    );
  }

  async update(board: BoardEntity) {
    await this._em.persistAndFlush(board);

    return board;
  }

  remove(id: string) {
    return this._boardRepository.nativeDelete({id});
  }
}
