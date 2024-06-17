import { Injectable }       from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { BoardEntity }      from '@modules/scrumboard/entities/board.entity';
import { EntityRepository } from '@mikro-orm/postgresql';
import { CreateBoardDto }   from '@modules/scrumboard/dtos/create-board.dto';
import { EntityManager }    from '@mikro-orm/core';
import { UpdateBoardDto }   from '@modules/scrumboard/dtos/update-board.dto';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(BoardEntity) private readonly boardRepository: EntityRepository<BoardEntity>,
    private readonly _em: EntityManager,
  ) {}

  async create(createBoardDto: CreateBoardDto) {
    const board = this.boardRepository.create(createBoardDto);
    await this._em.persistAndFlush(board);

    return board;
  }

  findAll() {
    return this.boardRepository.findAll();
  }

  findOne(id: string) {
    return this.boardRepository.findOne(id);
  }

  update(id: string, updateBoardDto: UpdateBoardDto) {
    return this.boardRepository.nativeUpdate({id}, updateBoardDto);
  }

  remove(id: string) {
    return this.boardRepository.nativeDelete({id});
  }
}
