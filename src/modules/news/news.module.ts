import { Module } from '@nestjs/common';

import { MikroOrmModule } from '@mikro-orm/nestjs';

import { CommentModule }          from '@modules/comment/comment.module';
import { CompanyUserModule }      from '@modules/company-user/company-user.module';
import { LikeModule }             from '@modules/likes/like.module';
import { NewsController }         from '@modules/news/controllers/news.controller';
import { NewsCategoryController } from '@modules/news/controllers/news-category.controller';
import { NewsEntity }             from '@modules/news/entities/news.entity';
import { NewsCategoryEntity }     from '@modules/news/entities/news-category.entity';
import { NewsUserReadEntity }     from '@modules/news/entities/news-user-read.entity';
import { NewsService }            from '@modules/news/services/news.service';
import { NewsCategoryService }    from '@modules/news/services/news-category.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      NewsEntity,
      NewsUserReadEntity,
      NewsCategoryEntity
    ]),
    CompanyUserModule,
    LikeModule,
    CommentModule
  ],
  providers: [
    NewsService,
    NewsCategoryService
  ],
  exports: [ NewsService ],
  controllers: [
    NewsController,
    NewsCategoryController
  ],
})
export class NewsModule {
}
