import { Module } from '@nestjs/common';

import { MikroOrmModule } from '@mikro-orm/nestjs';

import { CommentEntity } from '@modules/comment/entities/comment.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      CommentEntity
    ])
  ],
  providers: [],
  exports: [],
  controllers: [],
})
export class CommentModule {
}
