import { Module }         from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { EventEntity }    from '@modules/events/entities/event.entity';
import { EventController } from './event.controller';
import { EventService } from './event.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([ EventEntity ])
  ],
  controllers: [EventController],
  providers: [EventService],
  exports: [],
})
export class EventsModule {

}
