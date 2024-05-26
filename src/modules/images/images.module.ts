import { Module } from '@nestjs/common';

import { MikroOrmModule } from '@mikro-orm/nestjs';

import { AlbumEntity }     from '@modules/images/entities/album.entity';
import { ImageEntity }     from '@modules/images/entities/image.entity';
import { AlbumController } from '@modules/images/controllers/album.controller';
import { ImageController } from '@modules/images/controllers/image.controller';
import { AlbumService }    from '@modules/images/services/album.service';
import { ImageService }    from '@modules/images/services/image.service';

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
