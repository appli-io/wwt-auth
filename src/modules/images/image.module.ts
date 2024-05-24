import { Module }          from '@nestjs/common';
import { ImageService }    from './image.service';
import { ImageController } from './image.controller';
import { ImageEntity }     from './entities/image.entity';
import { MikroOrmModule }  from '@mikro-orm/nestjs';

@Module({
  imports: [ MikroOrmModule.forFeature([ ImageEntity ]) ],
  controllers: [ ImageController ],
  providers: [ ImageService ],
  exports: [ ImageService ]
})
export class ImageModule {}
