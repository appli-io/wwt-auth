import { Module } from '@nestjs/common';

import { MikroOrmModule } from '@mikro-orm/nestjs';

import { CommentEntity }  from '@modules/comment/entities/comment.entity';
import { CommentService } from '@modules/comment/comment.service';

@Module({
  controllers: [],
  imports: [
    MikroOrmModule.forFeature([
      CommentEntity
    ])
  ],
  providers: [ CommentService ],
  exports: [ CommentService ],
})
export class CommentModule {
}
