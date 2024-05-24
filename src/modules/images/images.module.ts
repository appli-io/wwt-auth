import { Module } from '@nestjs/common';

import { MikroOrmModule } from '@mikro-orm/nestjs';

import { AlbumEntity }     from '@modules/images/entities/album.entity';
import { ImageEntity }     from '@modules/images/entities/image.entity';
import { AlbumController } from '@modules/images/album.controller';
import { ImageController } from '@modules/images/image.controller';
import { AlbumService }    from '@modules/images/album.service';
import { ImageService }    from '@modules/images/image.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([ AlbumEntity, ImageEntity ]),
  ],
  controllers: [
    AlbumController,
    ImageController
  ],
  providers: [
    AlbumService,
    ImageService
  ],
})
export class ImagesModule {}
