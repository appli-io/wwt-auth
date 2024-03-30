import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@mikro-orm/nestjs';
import { LikeEntity }       from '@modules/likes/entities/like.entity';
import { EntityRepository } from '@mikro-orm/postgresql';

import { CommonService } from '@common/common.service';
import { CreateLikeDto } from '@modules/likes/dtos/create-like.dto';
import { ILike }         from '@modules/likes/interface/like.interface';
import { ContentType }   from '@modules/shared/enums/content-type.enum';

@Injectable()
export class LikeService {

  constructor(
    @InjectRepository(LikeEntity) private readonly _likeRepository: EntityRepository<LikeEntity>,
    private readonly _commonService: CommonService
  ) {}

  public async findBy(whereOptions: Partial<ILike>): Promise<LikeEntity> {
    return this._likeRepository.findOne({...whereOptions});
  }

  public async findAndCountBy(whereOptions: Partial<ILike>): Promise<[ LikeEntity[], number ]> {
    return this._likeRepository.findAndCount({...whereOptions});
  }

  public async countBy(whereOptions: Partial<ILike>): Promise<number> {
    return this._likeRepository.count({...whereOptions});
  }

  public async countByContentTypeAndContentId(contentType: ContentType, contentId: string): Promise<number> {
    return this._likeRepository.count({contentType, contentId});
  }

  public async create(createLikeDto: CreateLikeDto): Promise<LikeEntity> {
    const like: LikeEntity = await this.findBy({
      ...createLikeDto,
      createdBy: createLikeDto.userId,
    });

    if (like) return like;

    const newLike: LikeEntity = this._likeRepository.create({
      ...createLikeDto,
      createdBy: createLikeDto.userId,
    });

    await this._commonService.saveEntity(newLike, true);
    return newLike;
  }

  public async remove(id: string): Promise<void> {
    const like: LikeEntity = await this._likeRepository.findOne(id);

    // TODO: Analyze if this is necessary
    // if (!like) throw new NotFoundException(`Like with id ${ id } not found`);

    await this._commonService.removeEntity(like);
  }
}
