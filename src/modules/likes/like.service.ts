import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository }              from '@mikro-orm/nestjs';
import { LikeEntity }                    from '@modules/likes/entities/like.entity';
import { EntityRepository }              from '@mikro-orm/postgresql';
import { CommonService }                 from '@common/common.service';
import { ContentType }                   from '@modules/shared/enums/content-type.enum';
import { CreateLikeDto }                 from '@modules/likes/dtos/create-like.dto';

@Injectable()
export class LikeService {

  constructor(
    @InjectRepository(LikeEntity) private readonly _likeRepository: EntityRepository<LikeEntity>,
    private readonly _commonService: CommonService
  ) {}

  public async create(createLikeDto: CreateLikeDto): Promise<LikeEntity> {
    const like: LikeEntity = await this.findByUserIdAndContentTypeAndContentId(createLikeDto.userId, createLikeDto.contentType, createLikeDto.contentId);

    if (like) {
      like.isDeleted = false;
      await this._commonService.saveEntity(like);

      return like;
    }

    const newLike: LikeEntity = this._likeRepository.create(createLikeDto);

    await this._commonService.saveEntity(newLike, true);
    return newLike;
  }

  public async remove(id: string): Promise<void> {
    const like: LikeEntity = await this._likeRepository.findOne(id);

    if (!like) throw new NotFoundException(`Like with id ${ id } not found`);

    like.isDeleted = true;
    await this._commonService.saveEntity(like);
  }

  public async findByUserIdAndContentTypeAndContentId(userId: number, contentType: ContentType, contentId: string): Promise<LikeEntity> {
    return this._likeRepository.findOne({userId, contentType, contentId});
  }
}
