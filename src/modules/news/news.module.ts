import { Module } from '@nestjs/common';

import { MikroOrmModule } from '@mikro-orm/nestjs';

import { CompanyUserModule }  from '@modules/company-user/company-user.module';
import { LikeModule }         from '@modules/likes/like.module';
import { NewsController }     from '@modules/news/controllers/news.controller';
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
    ]),
    CompanyUserModule,
    LikeModule
  ],
  providers: [ NewsService ],
  exports: [ NewsService ],
  controllers: [ NewsController ],
})
export class NewsModule {
}
