import { HttpModule } from '@nestjs/axios';
import { Module }     from '@nestjs/common';

import { BiobioController } from '@modules/biobio/biobio.controller';
import { BioBioService }    from '@modules/biobio/biobio.service';

@Module({
  imports: [ HttpModule ],
  controllers: [ BiobioController ],
  providers: [ BioBioService ],
  exports: []
})
export class BioBioModule {}
