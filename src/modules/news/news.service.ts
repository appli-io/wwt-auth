import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';

import { CommonService } from '@common/common.service';
import { NewsEntity }    from '@modules/news/entities/news.entity';
import { CreateNewsDto } from '@modules/news/dtos/create-news.dto';

@Injectable()
export class NewsService {

  constructor(
    @InjectRepository(NewsEntity) private readonly _newsRepository: EntityRepository<NewsEntity>,
    private readonly _commonService: CommonService,
  ) {}

  public async findAll(): Promise<NewsEntity[]> {
    return this._newsRepository.findAll();
  }

  public async findOne(id: string): Promise<NewsEntity> {
    return this._newsRepository.findOne({id});
  }

  public async findByCompanyId(companyId: string): Promise<NewsEntity[]> {
    return this._newsRepository.find({company: companyId});
  }

  public async create(newsDto: CreateNewsDto, userId: number, companyId: string): Promise<NewsEntity> {
    const news = this._newsRepository.create({
      ...newsDto,
      createdBy: userId,
      company: companyId,
    });

    await this._commonService.saveEntity(news, true);
    return news;
  }
}
