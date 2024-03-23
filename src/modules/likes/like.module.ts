import { Module } from '@nestjs/common';

import { MikroOrmModule } from '@mikro-orm/nestjs';

import { LikeEntity }  from '@modules/likes/entities/like.entity';
import { LikeService } from '@modules/likes/like.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      LikeEntity
    ])
  ],
  providers: [ LikeService ],
  exports: [ LikeService ],
  controllers: [],
})
export class LikeModule {
}
