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

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(BoardEntity) private readonly boardRepository: EntityRepository<BoardEntity>,
    private readonly _em: EntityManager,
  ) {}

  async create(createBoardDto: CreateBoardDto, companyUser: CompanyUserEntity, companyId: CompanyEntity['id']) {
    const board = this.boardRepository.create({
      ...createBoardDto,
      company: companyId,
      lastActivity: new Date()
    });
    board.members.add(companyUser);

    await this._em.persistAndFlush(board);

    return board;
  }

  findAll(userId: UserEntity['id'], companyId: CompanyEntity['id']) {
    return this.boardRepository.findAll({
      where: {company: companyId, members: {user: userId}},
      populate: [ 'members', 'members.user' ]
    });
  }

  findOne(id: string) {
    return this.boardRepository.findOne(
      id,
      {
        populate: [ 'members', 'members.user', 'lists', 'lists.cards', 'labels' ],
        orderBy: {lists: {cards: {position: 'asc'}}}
      }
    );
  }

  update(id: string, updateBoardDto: UpdateBoardDto) {
    return this.boardRepository.nativeUpdate({id}, updateBoardDto);
  }

  remove(id: string) {
    return this.boardRepository.nativeDelete({id});
  }
}
