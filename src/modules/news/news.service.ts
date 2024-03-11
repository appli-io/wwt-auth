import { Injectable }       from '@nestjs/common';
import { EntityRepository } from '@mikro-orm/postgresql';
import { NewsEntity }       from '@modules/news/entities/news.entity';
import { InjectRepository } from '@mikro-orm/nestjs';

@Injectable()
export class NewsService {

  constructor(
    @InjectRepository(NewsEntity) private readonly _newsRepository: EntityRepository<NewsEntity>,
  ) {}

  public async findAll(): Promise<NewsEntity[]> {
    return this._newsRepository.findAll();
  }

  public async findOne(id: string): Promise<NewsEntity> {
    return this._newsRepository.findOne({id});
  }

  public async findByCompanyId(companyId: string): Promise<NewsEntity[]> {
    return this._newsRepository.find({companyId});
  }
}
