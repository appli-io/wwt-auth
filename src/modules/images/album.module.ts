import { Module }          from '@nestjs/common';
import { AlbumService }    from './album.service';
import { AlbumController } from './album.controller';
import { AlbumEntity }     from './entities/album.entity';
import { MikroOrmModule }  from '@mikro-orm/nestjs';

@Module({
  imports: [ MikroOrmModule.forFeature([ AlbumEntity ]) ],
  controllers: [ AlbumController ],
  providers: [ AlbumService ],
  exports: [ AlbumService ]
})
export class AlbumModule {}
