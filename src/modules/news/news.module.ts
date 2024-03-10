import { Module }             from '@nestjs/common';
import { MikroOrmModule }     from '@mikro-orm/nestjs';
import { NewsService }        from '@modules/news/news.service';
import { NewsEntity }         from '@modules/news/entities/news.entity';
import { NewsUserReadEntity } from '@modules/news/entities/news-user-read.entity';
import { NewsCategoryEntity } from '@modules/news/entities/news-category.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      NewsEntity,
      NewsUserReadEntity,
      NewsCategoryEntity
    ])
  ],
  providers: [ NewsService ],
  exports: [ NewsService ],
  controllers: [],
})
export class NewsModule {
}
