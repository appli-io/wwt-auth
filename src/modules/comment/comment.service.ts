import { Injectable }                    from '@nestjs/common';
import { InjectRepository }              from '@mikro-orm/nestjs';
import { CommentEntity }                 from '@modules/comment/entities/comment.entity';
import { EntityRepository, FilterQuery } from '@mikro-orm/postgresql';
import { CommonService }                 from '@common/common.service';
import { CreateCommentDto }              from '@modules/comment/dtos/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity) private readonly _commentRepository: EntityRepository<CommentEntity>,
    private readonly _commonService: CommonService
  ) {}

  public async findAll(): Promise<CommentEntity[]> {
    return this._commentRepository.findAll();
  }

  public async findOneById(id: string): Promise<CommentEntity> {
    return this._commentRepository.findOne({id});
  }

  public async findAndCountBy(whereOptions: FilterQuery<CommentEntity> | Partial<CommentEntity>): Promise<[ CommentEntity[], number ]> {
    return this._commentRepository.findAndCount(whereOptions);
  }

  public async countBy(whereOptions: FilterQuery<CommentEntity> | Partial<CommentEntity>): Promise<number> {
    return this._commentRepository.count(whereOptions);
  }

  public async create(commentDto: CreateCommentDto): Promise<CommentEntity> {
    const comment: CommentEntity = this._commentRepository.create({
      ...commentDto,
      createdBy: commentDto.userId,
    });
    await this._commonService.saveEntity(comment, true);
    return comment;
  }

  public async remove(id: string): Promise<void> {
    const comment: CommentEntity = await this._commentRepository.findOne(id);
    comment.isDeleted = true;

    await this._commonService.saveEntity(comment);
  }
}
