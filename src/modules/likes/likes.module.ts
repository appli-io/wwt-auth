import { Module } from '@nestjs/common';

import { MikroOrmModule } from '@mikro-orm/nestjs';

import { LikeEntity } from '@modules/likes/entities/like.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      LikeEntity
    ])
  ],
  providers: [],
  exports: [],
  controllers: [],
})
export class CommentModule {
}
