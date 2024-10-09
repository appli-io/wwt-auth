import { Injectable }       from '@nestjs/common';
import { EntityRepository } from '@mikro-orm/postgresql';
import { LabelEntity }      from '@modules/scrumboard/entities/label.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { CommonService }    from '@common/common.service';
import { CreateLabelDto }   from '@modules/scrumboard/dtos/create-label.dto';

@Injectable()
export class LabelService {
  constructor(
    @InjectRepository(LabelEntity) private readonly _labelsRepository: EntityRepository<LabelEntity>,
    private readonly _commonService: CommonService,
  ) {}

  async findAll() {
    return this._labelsRepository.findAll();
  }

  async findOne(id: string) {
    return this._labelsRepository.findOne(id);
  }

  async create(boardId: string, dto: CreateLabelDto) {
    const label = this._labelsRepository.create({
      ...dto,
      board: boardId
    });

    await this._commonService.saveEntity(label);

    return label;
  }

  async remove(id: string) {
    const label = await this.findOne(id);

    await this._commonService.removeEntity(label);

    return label;
  }
}
